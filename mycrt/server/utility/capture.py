import pickle
import pymysql as sql
import boto3
from datetime import datetime
import time
import re
import sys

# Example of credentials dictionary
'''
credentials = {
  "aws_access_key" : access_key,
  "aws_secret_access_key" : secret_key,
  "region_name" : region
}
'''

#db_id = "pi"
hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"
region = "us-east-2"

def list_databases(credentials, rds_client = None, close_client = False):
  if rds_client is None:
    close_client = True
    rds_client = boto3.client('rds', **credentials)
  
  instances = rds_client.describe_db_instances()
  
  if close_client:
    rds_client.close()
  
  return [item['DBInstanceIdentifier'] for item in instances['DBInstances']]
  

def _line_filter(line):
  return "Query" in line[:30] and not (
    "2 Query SELECT 1" in line  or
    "PURGE BINARY LOGS TO" in line or 
    "select @@session" in line or 
    "INSERT INTO mysql.rds_heartbeat2" in line or 
    "2 Query SELECT count(*) from information_schema.TABLES WHERE TABLE_SCHEMA = 'mysql' AND TABLE_NAME = 'rds_heartbeat2'" in line or
    "2 Query SELECT value FROM mysql.rds_heartbeat2" in line or
    "2 Query SELECT NAME, VALUE FROM mysql.rds_configuration" in line
    )


def _parse_line(line):

  pattern = re.compile("\d+ \d{1,2}:\d{1,2}:\d{1,2}")

  match = pattern.match(line)
  if match is None:
    return ("", line.split(" ", 1)[1])
  else:
    return (match.group(), line.split(" ", 2)[2])

def _parse_log_file(log_file, start_time):

  log_file_lines = log_file["LogFileData"].replace("\t"," ").split("\n")
  log_file_lines = [line.strip() for line in log_file_lines if _line_filter(line)]

  transactions = [_parse_line(line) for line in log_file_lines]

  filter_index = 0
  pattern = "%y%m%d %H:%M:%S"
  last_time = datetime.now()
  for i in range(len(transactions)-1, -1, -1):
    time, line = transactions[i]
    if time != "":
      last_time = datetime.strptime(time, pattern)
      if last_time < start_time:
        filter_index = i+1
        break
    
  return transactions[filter_index:]


def _create_bucket(s3_client):
  bucket_id = "my-crt-test-bucket-olive-chinos"
  try:
    # Ensure only one bucket exists
    s3_client.delete_bucket(bucket_id)
  except:
    pass  

  s3_client.create_bucket(
    Bucket = bucket_id,
    CreateBucketConfiguration = {"LocationConstraint" : region}
  )

  return bucket_id

def _put_bucket(s3_client, data, bucket_id, log_key = "test-log.txt"):

  byte_log = pickle.dumps(data)

  s3_client.put_object(
    Bucket = bucket_id,
    Body = byte_log,
    Key = log_key
  )

start_time = [None]

def start_capture(credentials, db_id = "pi"):
  start_time[0] = datetime.now()

def end_capture(credentials, db_id = "pi"):
  region = credentials['region_name']
  rds_client = boto3.client('rds', **credentials)
  s3_client = boto3.client('s3', **credentials)

  #instances = rds_client.describe_db_instances(DBInstanceIdentifier=db_id)
  instances = rds_client.describe_db_instances()
  print (instances, file=sys.stderr)

  rds_host = instances.get('DBInstances')[0].get('Endpoint').get('Address') 

  log_file = rds_client.download_db_log_file_portion(
    DBInstanceIdentifier = db_id,
    LogFileName = "general/mysql-general.log")
  
  transactions = _parse_log_file(log_file, start_time[0])

  #bucket_id = _create_bucket(s3_client)
  bucket_id = "my-crt-test-bucket-olive-chinos"
  _put_bucket(s3_client, transactions, bucket_id)

  return transactions

def testConnection(connection):
    
  cur = connection.cursor()
  flag = True
  while (flag):
    command = input("Give command : ")  
    if (command == "exit"):
      break
    
    cur.execute(command)

    for line in cur.fetchall():
      print(line)

#myConnection = sql.connect(host = hostname, user = username, passwd = password, db = database)
#testConnection(myConnection)
#myConnection.close()
#bucket_obj = s3_client.get_object(
#  Bucket = bucket_id,
#  Key = log_key
#)
#new_byte_log = pickle.loads(bucket_obj["Body"].read())
