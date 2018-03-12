import pymysql as sql
import boto3
from datetime import datetime, timedelta
import pickle
import sys
import time
from multiprocessing import Manager, Process, Lock
import os

from .capture import *

#db_id = "pi"
#hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"
period = 10

manager = Manager()
replays_in_progress = manager.dict()
db_in_use = manager.dict()
lock = Lock()

def _get_hostname(rds_client, db_id):
  instances = rds_client.describe_db_instances(DBInstanceIdentifier=db_id)
  rds_host = instances.get('DBInstances')[0].get('Endpoint').get('Address')
  return rds_host

def _execute_transactions(hostname, transactions, fast_mode):
  connection = sql.connect(host = hostname, user = username, passwd = password, db = database)
  cur = connection.cursor()
  start_time = datetime.utcnow()
  start_test = datetime.now()

  for _, command in transactions:
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

def _place_in_dict(db_id, replay_name, capture_name, fast_mode, restore_db, db_in_use, replays_in_progress, lock):
  replays_in_progress[capture_name + "/" + replay_name] = {
      "replayName" : replay_name,
      "captureName" : capture_name,
      "db" : db_id,
      "mode" : fast_mode,
      "pid" : os.getpid()
    }

  with lock:
    if db_id in db_in_use:
      db_in_use[db_id] = db_in_use[db_id] + [os.getpid()]
    else:
      db_in_use[db_id] = [os.getpid()]

def _remove_from_dict(replay_name, capture_name, db_id, db_in_use, replays_in_progress, lock):
  with lock:
    del replays_in_progress[capture_name + "/" + replay_name]
    db_in_use[db_id] = db_in_use[db_id][1:] # remove first element

def get_active_db():
  return [key for key, _ in db_in_use.items()]

def get_active_replays():
  fields = ["replayName", "captureName", "db", "mode"]
  rep_list = []
  for _, replay in replays_in_progress.items():
    rep_list.append({field : replay[field] for field in fields})

  return { "replays" : rep_list }

def execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db):
  proc = Process(target = _manage_replay,
                 args = (credentials, db_id, replay_name, capture_name, fast_mode, restore_db, db_in_use, replays_in_progress, lock))
  proc.start()

def _manage_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, db_in_use, replays_in_progress, lock):
  _place_in_dict(db_id, replay_name, capture_name, fast_mode, restore_db, db_in_use, replays_in_progress, lock)
  pid = os.getpid()
  while (db_id in db_in_use) and (pid != db_in_use[db_id][0]):
    time.sleep(3) # sleep three seconds and try again later
  
  _execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db)
  _remove_from_dict(replay_name, capture_name, db_id, db_in_use, replays_in_progress, lock)

def _execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db):
  rds_client = boto3.client('rds', **credentials)
  s3_client = boto3.client('s3', **credentials)
  cloudwatch_client = boto3.client('cloudwatch', **credentials)

  hostname = _get_hostname(rds_client, db_id)
  path_name = capture_name.replace(".cap", "")
  capture_path = path_name + "/" + path_name + ".cap"
  transactions = _get_transactions(s3_client, log_key = capture_path)

  start_time, end_time = _execute_transactions(hostname, transactions, fast_mode)

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
