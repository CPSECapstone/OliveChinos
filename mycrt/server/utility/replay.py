import pymysql as sql
import boto3
import datetime
import pickle

import capture

#db_id = "pi"
#hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"

def _get_hostname(rds_client, db_id):
  instances = rds_client.describe_db_instances(DBInstanceIdentifier=db_id)
  rds_host = instances.get('DBInstances')[0].get('Endpoint').get('Address')
  return rds_host

def _execute_transactions(hostname, transactions):
  myConnection = sql.connect(host = hostname, user = username, passwd = password, db = database)
  cur = connection.cursor()
  start_time = datetime.datetime.utcnow()

  for _, command in transactions:
    cur.execute(command)

  end_time = datetime.datetime.utcnow()

  myConnection.close()
  return start_time, end_time

def _get_transactions(s3_client, bucket_id = "my-crt-test-bucket-olive-chinos", log_key = "test-log"):
  bucket_obj = s3_client.get_object(
    Bucket = bucket_id,
    Key = log_key
  )
  new_byte_log = bucket_obj["Body"].read()
  transactions = pickle.loads(new_byte_log)

  return transactions

def _get_metrics(cloudwatch_client, start_time, end_time):
  return cloudwatch_client.get_metric_statistics(
      Namespace='AWS/RDS',
      MetricName='FreeableMemory',
      Dimensions = [{
           "Name" : "DBInstanceIdentifier",
           "Value" : "pi"
      }],
      StartTime=startTime,
      EndTime=endTime,
      Period=60,
      Statistics=[
          'Average'
     ]
  )

def _store_metrics(s3_client, metrics, bucket_id = "my-crt-test-bucket-olive-chinos", log_key = "test-metrics"):

  byte_log = pickle.dumps(metrics)

  s3_client.put_object(
    Bucket = bucket_id,
    Body = byte_log,
    Key = log_key
  )

def execute_replay(credentials, db_id = "pi"):
  rds_client = boto3.client('rds', **credentials)
  s3_client = boto3.client('s3', **credentials)
  cloudwatch_client = boto3.client('cloudwatch', **credentials)

  hostname = _get_hostname(rds_client, db_id)
  transactions = _get_transactions(s3_client)

  start_time, end_time = _execute_transactions(hostname, transactions)

  metrics = _get_metrics(cloudwatch_client, start_time, end_time)
  
  _store_metrics(s3_client, metrics)
  

