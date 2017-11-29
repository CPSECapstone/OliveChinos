import pymysql as sql
import boto3
from datetime import datetime, timedelta
import pickle
import sys

from .capture import *

#db_id = "pi"
#hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"
period = 1

def _get_hostname(rds_client, db_id):
  instances = rds_client.describe_db_instances(DBInstanceIdentifier=db_id)
  rds_host = instances.get('DBInstances')[0].get('Endpoint').get('Address')
  return rds_host

def _execute_transactions(hostname, transactions):
  connection = sql.connect(host = hostname, user = username, passwd = password, db = database)
  cur = connection.cursor()
  start_time = datetime.utcnow()
  start_test = datetime.now()

  print (transactions, file=sys.stderr)
  print('\n', len(transactions), file=sys.stderr)
  i = 0
  for _, command in transactions:
    i += 1
    if i % 10 == 0:
      print(i, file = sys.stderr)
    try:
      cur.execute(command)
    except:
      pass
  end_time = datetime.utcnow()
  
  connection.close()
  return start_time, end_time

def _get_transactions(s3_client, bucket_id = "my-crt-test-bucket-olive-chinos", log_key = "test-log.txt"):
  bucket_obj = s3_client.get_object(
    Bucket = bucket_id,
    Key = log_key
  )
  new_byte_log = bucket_obj["Body"].read()
  transactions = pickle.loads(new_byte_log)

  #transactions = [(x,y[6:]) for x,y in transactions]

  print (transactions, file=sys.stderr)

  return transactions

def _get_metrics(cloudwatch_client, metric_name, start_time, end_time):
  return cloudwatch_client.get_metric_statistics(
      Namespace='AWS/RDS',
      MetricName=metric_name,
      Dimensions = [{
           "Name" : "DBInstanceIdentifier",
           "Value" : "pi"
      }],
      StartTime=start_time,
      EndTime=end_time,
      Period=period,
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

  print (start_time, end_time, file=sys.stderr)

  CPUUtilizationMetric =  _get_metrics(cloudwatch_client, "CPUUtilization", start_time, end_time)
  FreeableMemoryMetric = _get_metrics(cloudwatch_client, "FreeableMemory", start_time, end_time)
  ReadIOPSMetric = _get_metrics(cloudwatch_client, "ReadIOPS", start_time, end_time)
  WriteIOPSMetric = _get_metrics(cloudwatch_client, "WriteIOPS", start_time, end_time)

  metrics = {
    "CPUUtilization": CPUUtilizationMetric["Datapoints"],
    "FreeableMemory": FreeableMemoryMetric["Datapoints"],
    "ReadIOPS": ReadIOPSMetric["Datapoints"],
    "WriteIOPS": WriteIOPSMetric["Datapoints"],
    "start_time": start_time,
    "end_time": end_time,
    "period": period,
    "db_id": db_id
  }

  print ("Metrics\n\n", file=sys.stderr)
  print (metrics, file=sys.stderr)
  
  _store_metrics(s3_client, metrics)
  

