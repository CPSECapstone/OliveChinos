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

'''
This runs a query on the utility database by default 
'''
def execute_utility_query(query, hostname = hostname, username = username, password = password, database = database):
  connection = sql.connect(host = hostname, user = username, passwd = password, db = database, autocommit = True)
  cur = connection.cursor()
  cur.execute(query)
  results = cur.fetchall()
  connection.close()
  return results

'''
Returns true if the capture_name is valid
'''
def verify_capture_name(name):
  query = '''select * from Captures where capture_name = '{0}' '''
  results = execute_utility_query(query)
  return len(results) == 0

def list_databases(credentials, rds_client = None, close_client = False):
  if rds_client is None:
    rds_client = boto3.client('rds', **credentials)
  
  instances = rds_client.describe_db_instances()
  
  return {item['DBInstanceIdentifier'] : item['Endpoint']['Address'] for item in instances['DBInstances']}
  

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

def start_capture(capture_name, db_id):
  start_time = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
  query = '''INSERT INTO Captures (db, name, start_time, end_time) 
               VALUES ('{0}', '{1}', '{2}', NULL)'''.format(db_id, capture_name, start_time)
  print(query, file=sys.stderr)
  execute_utility_query(query)
  print (start_time, file=sys.stderr)

def end_capture(credentials, capture_name, db_id):
  end_time = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
  execute_utility_query('''UPDATE Captures SET end_time = '{0}' WHERE db = '{1}' AND name = '{2}' '''.format(end_time, db_id, capture_name))
  # Unpack results to get start and end time from the capture we are finishing
  query_res = execute_utility_query('''SELECT start_time FROM Captures WHERE db = '{0}' AND name = '{1}' '''.format(db_id, capture_name)) 
  start_time = query_res[0][0]
  print(query_res, file=sys.stderr)
  print('''SELECT start_time FROM Captures WHERE db = '{0}' AND name = '{1}' '''.format(db_id, capture_name), file=sys.stderr)
  s3_client = boto3.client('s3', **credentials)
  
  databases = list_databases(credentials)
  address = databases[db_id]
  
  query = '''
      SELECT event_time, argument 
      FROM mysql.general_log 
      WHERE user_host <> 'rdsadmin[rdsadmin] @ localhost [127.0.0.1]'
      AND event_time >= '{0}' AND event_time <= '{1}'
      AND command_type = 'Query'
  '''.format(start_time.strftime("%Y/%m/%d %H:%M:%S"), end_time)

  transactions = execute_utility_query(query, hostname = address) # need to give username and password eventually

  bucket_id = "my-crt-test-bucket-olive-chinos"
  _put_bucket(s3_client, transactions, bucket_id, log_key = "{0}/{0}.cap".format(capture_name))

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
