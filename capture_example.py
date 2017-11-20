import pickle
import pymysql as sql
import boto3
import time
import re

db_id = "pi"
hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"

access_key = None # Replace with actual keys
secret_key = None
region = "us-east-2"

credentials = {
  "aws_access_key" : access_key,
  "aws_secret_access_key" : secret_key,
  "region_name" : region
}


s3_client = boto3.client(
  's3',
  aws_access_key_id = access_key,
  aws_secret_access_key = secret_key,
  region_name = region
)

rds_client = boto3.client( 
  'rds',
  aws_access_key_id = access_key,
  aws_secret_access_key = secret_key,
  region_name = region
)

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

print("Attempt to connect to database.")

myConnection = sql.connect(host = hostname, user = username, passwd = password, db = database)

print("Connection made.")

testConnection(myConnection)

print("Closing connection.")

myConnection.close()

print("Connection closed.")

print("Accessing log file.")

def notBanned(line):
  return "Query" in line[:30] and not (
    "2 Query SELECT 1" in line  or 
    "2 Query SELECT count(*) from information_schema.TABLES WHERE TABLE_SCHEMA = 'mysql' AND TABLE_NAME = 'rds_heartbeat2'" in line or
    "2 Query SELECT value FROM mysql.rds_hearbeat2" in line or
    "2 Query SELECT NAME< VALUE FROM mysql.rds_configuration" in line or
    )

log_file = rds_client.download_db_log_file_portion(
  DBInstanceIdentifier = db_id,
  LogFileName = "general/mysql-general.log")
log_file_lines = log_file["LogFileData"].replace("\t"," ").split("\n")
log_file_lines = [line.strip() for line in log_file_lines if notBanned(line)]

print("Log file found. Here are some raw lines from it:")

print(log_file_lines[:10])

pattern = re.compile("\d+ \d{1,2}:\d{1,2}:\d{1,2}")
def parseLine(line):
  match = pattern.match(line)
  if match is None:
    return ("", line.split(" ", 1)[1])
  else:
    return (match.group().split(" ")[1], line.split(" ", 2)[2])

transactions = [parseLine(line) for line in log_file_lines]

print("Log file parsed. Here is a preview of the data structure:")

print(transactions[:10])

print("Creating S3 bucket.")

# Buckets need a GLOBALLY unique name
bucket_id = "my-crt-test-bucket-olive-chinos"
s3_client.create_bucket(
  Bucket = bucket_id,
  CreateBucketConfiguration = {"LocationConstraint" : region}
)

print("S3 bucket made. Sending object into bucket.")

byte_log = pickle.dumps(transactions)

log_key = "test-log"
s3_client.put_object(
  Bucket = bucket_id,
  Body = byte_log,
  Key = log_key
)

print("Object sent. Attempting to read back object from bucket.")

bucket_obj = s3_client.get_object(
  Bucket = bucket_id,
  Key = log_key
)
new_byte_log = pickle.loads(bucket_obj["Body"].read())

print("Object found. Here is the data read:")

print(new_byte_log[:20])


print("Script complete.") 




