import pymysql as sql
import boto3
from datetime import datetime, timedelta
import pickle
import sys
import time
from multiprocessing import Manager, Process, Lock
import os

from .capture import *
from .communications import ComManager
from .analytics import get_capture_replay_list 

#db_id = "pi"
#hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"
period = 10

manager = None
replays_in_progress = None
db_in_use = None
lock = None


def init_replay():
  global manager
  global replays_in_progress
  global db_in_use
  global lock
  manager = Manager()
  replays_in_progress = manager.dict()
  db_in_use = manager.dict()
  lock = Lock()



def _get_hostname(rds_client, db_id):
  instances = rds_client.describe_db_instances(DBInstanceIdentifier=db_id)
  rds_host = instances.get('DBInstances')[0].get('Endpoint').get('Address')
  return rds_host

def _execute_transactions(hostname, transactions, fast_mode, database, username, password):
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

def _get_transactions(s3_client, bucket_id = None, log_key = "test-log.txt"):
  if bucket_id is None:
    bucket_id = ComManager.S3name

  bucket_obj = s3_client.get_object(
    Bucket = bucket_id,
    Key = log_key
  )
  new_byte_log = bucket_obj["Body"].read()
  transactions = pickle.loads(new_byte_log)

  #transactions = [(x,y[6:]) for x,y in transactions]

  return transactions

def check_if_replay_name_is_unique(capture_name, replay_name, cm):
   query = '''SELECT * FROM Replays WHERE capture='{0}' AND replay='{1}' '''.format(capture_name, replay_name)
   print(query)
   return len(cm.execute_query(query)) == 0

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

def _store_metrics(s3_client, metrics, bucket_id = None, log_key = "test-folder/test-metrics"):
  if bucket_id is None:
    bucket_id = ComManager.S3name

  byte_log = pickle.dumps(metrics)

  s3_client.put_object(
    Bucket = bucket_id,
    Body = byte_log,
    Key = log_key
  )

#Need to add "rds" if ever going to poll for replays in progress
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

def get_replay_number():
  return len(replays_in_progress)

def get_active_replays():
  fields = ["replayName", "captureName", "db", "mode"]
  rep_list = []
  for _, replay in replays_in_progress.items():
    rep_list.append({field : replay[field] for field in fields})

  return { "replays" : rep_list }

def execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, cm):
  proc = Process(target = _manage_replay,
                 args = (credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, db_in_use, replays_in_progress, lock, ComManager()))
  proc.start()

def _update_replay_count():
  print("In _update_replay_count", file=sys.stderr)
  requests.get("http://localhost:5000/update_replay_count")

def _manage_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, db_in_use, replays_in_progress, lock, cm):
  _place_in_dict(db_id, replay_name, capture_name, fast_mode, restore_db, db_in_use, replays_in_progress, lock)
  pid = os.getpid()
  #while (db_id in db_in_use) and (pid != db_in_use[db_id][0]):
  #  time.sleep(3) # sleep three seconds and try again later
  _update_replay_count()
  _execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, cm)
  _remove_from_dict(replay_name, capture_name, db_id, db_in_use, replays_in_progress, lock)
  _update_replay_count()

def _execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, cm):
  rds_client = cm.get_boto('rds')
  s3_client = cm.get_boto('s3')
  cloudwatch_client = cm.get_boto('cloudwatch')

  hostname = _get_hostname(rds_client, rds_name)
  path_name = capture_name.replace(".cap", "")
  capture_path = "mycrt/" + path_name + "/" + path_name + ".cap"
  transactions = _get_transactions(s3_client, log_key = capture_path)

  start_time, end_time = _execute_transactions(hostname, transactions, fast_mode, db_id, username, password)

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

  _store_metrics(s3_client, metrics, log_key = "mycrt/" + path_name + "/" + replay_name + ".replay")
 
  query = """INSERT INTO Replays (replay, capture, db, mode, rds) VALUES ('{0}', '{1}', '{2}', '{3}', '{4}')""".format(replay_name, capture_name, db_id, "fast" if fast_mode else "time", rds_name)
  cm.execute_query(query)
  
def delete_replay(credentials, capture_name, replay_name, cm):
  '''Remove all traces of a replay in S3.

  Code referenced from here: https://stackoverflow.com/questions/33104579/boto3-s3-folder-not-getting-deleted

  Args:
    credentials: A dictionary resembling the structure at the top of the file
    capture_name: A preexisting capture name
    replay_name: A preexisting replay name
  '''

  query = """delete from Replays where replay = '{0}' and capture = '{1}'""".format(replay_name, capture_name)
  cm.execute_query(query)

  s3_client = cm.get_boto('s3')
  bucket_id = ComManager.S3name

  try:
    s3_client.delete_object(Bucket = bucket_id, Key = "mycrt/" + capture_name + "/" + replay_name + ".replay")
  except Exception:
    print("Replay to delete does not exist.", file=sys.stderr)

def get_replays_from_table(cm):
  query = "select replay, capture, db, mode, rds from Replays"
  results = cm.execute_query(query)
  replays = [{"replay" : replay, "capture" : capture, "db" : db, "mode" : mode, "rds": rds} for (replay, capture, db, mode, rds) in results]
  return {"replays" : replays}

def _populate_replay_table(cm):
  table_replays = cm.execute_query("select replay, capture from Replays")
  table_replays = set((capture, replay) for (replay, capture) in table_replays)
  s3_replays = get_capture_replay_list({"region_name":"us-east-2"}) 
  replays_to_add = set()
  for capture, replays in s3_replays:
    for replay in replays:
      replay = replay.replace(".replay", "")
      if (capture, replay) not in table_replays:
        query = '''INSERT INTO Replays (replay, capture, db, mode, rds) 
                   VALUES ('{0}', '{1}', 'unknown', 'unknown', 'unknown')'''.format(replay, capture)
        cm.execute_query(query)

