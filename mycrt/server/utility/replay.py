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
period = 10

def _get_hostname(rds_client, db_id):
  instances = rds_client.describe_db_instances(DBInstanceIdentifier=db_id)
  rds_host = instances.get('DBInstances')[0].get('Endpoint').get('Address')
  return rds_host

def _execute_transactions(hostname, transactions, fast_mode):
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
      #StartTime=start_time,
      StartTime=end_time - timedelta(hours=1),
      EndTime=end_time,
      Period=period,
      Statistics=[
          'Average'
     ]
  )

def _store_metrics(s3_client, metrics, bucket_id = "my-crt-test-bucket-olive-chinos", log_key = "test-folder/test-metrics"):

  byte_log = pickle.dumps(metrics)

  s3_client.put_object(
    Bucket = bucket_id,
    Body = byte_log,
    Key = log_key
  )

def execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db):
  rds_client = boto3.client('rds', **credentials)
  s3_client = boto3.client('s3', **credentials)
  cloudwatch_client = boto3.client('cloudwatch', **credentials)

  hostname = _get_hostname(rds_client, db_id)
  path_name = capture_name.replace(".cap", "")
  capture_path = path_name + "/" + path_name + ".cap"
  transactions = _get_transactions(s3_client, log_key = capture_path)

  start_time, end_time = _execute_transactions(hostname, transactions, fast_mode)

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
  
  _store_metrics(s3_client, metrics, log_key = path_name + "/" + replay_name + ".replay")
  
def delete_replay(credentials, capture_name, replay_name):
  '''Remove all traces of a replay in S3.

  Code referenced from here: https://stackoverflow.com/questions/33104579/boto3-s3-folder-not-getting-deleted

  Args:
    credentials: A dictionary resembling the structure at the top of the file
    capture_name: A preexisting capture name
    replay_name: A preexisting replay name
  '''

  s3_resource = boto3.resource('s3', **credentials)
  bucket_id = "my-crt-test-bucket-olive-chinos"

  try:
    s3_resource.Object(bucket_id, capture_name + "/" + replay_name + ".replay").delete()
  except Exception:
    print("Replay to delete does not exist.", file=sys.stderr)
