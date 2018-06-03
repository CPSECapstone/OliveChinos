import pymysql as sql
import boto3
from datetime import datetime, timedelta
import pickle
import sys
import time
from multiprocessing import Manager, Process, Lock
import os, signal
import re

from .capture import *
from .communications import ComManager
from .analytics import _get_capture_replay_list 

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
  ''' Initializes global variables for replay.
  '''
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

def _is_in_filters(command, filters):
  return any(re.match(f, command) for f in filters)

def _execute_transactions(hostname, transactions, fast_mode, database, username, password, filters):
  connection = sql.connect(host = hostname, user = username, passwd = password, db = database)
  cur = connection.cursor()

  if filters != "" and filters is not None:
    filters = filters.split("\n")
    transactions = [(c_time, command) for c_time, command in transactions if not _is_in_filters(command, filters)]
  else:
    transactions = list(transactions)
  transactions.sort(key = lambda x: x[0]) # ensure proper ordering by time 
  if not fast_mode:
    first_time = transactions[0][0]
    transactions = [((c_time - first_time).total_seconds(), command) for c_time, command in transactions]
  start_time = datetime.utcnow()

  if fast_mode:
    for _, command in transactions:
      try:
        print("fast: ", command, file=sys.stderr)
        cur.execute(command)
      except:
        pass
  else:
    for seconds_to_elapse, command in transactions:
      seconds_elapsed = (datetime.utcnow() - start_time).total_seconds()
      if seconds_elapsed < seconds_to_elapse:
        time.sleep(seconds_to_elapse - seconds_elapsed)
      cur.execute(command)
      print("time: ", command, file=sys.stderr)

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
  ''' Checks if a replay name is unique.
  
  Arguments: 
    capture_name - String, a capture name
    replay_name - String, a potential replay name
    cm - A ComManager object

  Returns:
    Boolean, True if unique, False if not
  '''
  query = '''SELECT * FROM Replays WHERE capture='{0}' AND replay='{1}' '''.format(capture_name, replay_name)
  #print(query)
  return len(cm.execute_query(query)) == 0

def _get_metrics(cloudwatch_client, metric_name, start_time, end_time, rds_instance):
  return cloudwatch_client.get_metric_statistics(
      Namespace='AWS/RDS',
      MetricName=metric_name,
      Dimensions = [{
           "Name" : "DBInstanceIdentifier",
           "Value" : rds_instance
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
def _place_in_dict(db_id, replay_name, capture_name, fast_mode, restore_db, db_in_use, rds, replays_in_progress, lock):
  replays_in_progress[capture_name + "/" + replay_name] = {
      "replayName" : replay_name,
      "captureName" : capture_name,
      "db" : db_id,
      "rds": rds,
      "start_time": datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S"),
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
    try:
      del replays_in_progress[capture_name + "/" + replay_name]
      db_in_use[db_id] = db_in_use[db_id][1:] # remove first element
    except:
      pass

def get_active_db():
  ''' Returns a list of databases that are currently in use by ongoing replays.

  Returns:
    List of database names
  '''
  return [key for key, _ in db_in_use.items()]

def get_replay_number():
  ''' Returns the number of ongoing replays.

  Returns:
    Integer
  '''
  return len(replays_in_progress)

def get_active_replays():
  ''' Returns a list containing the ongoing replays.

  Returns:
    {
      'replays' : [{
        'replay' : String,
        'capture' : String,
        'rds' : String,
        'db' : String,
        'mode' : String},
        ...
      ]
    }
  '''
  fields = ["replayName", "captureName", "db", "rds", "mode", "start_time"]
  field_conversion = {
    "replayName" : "replay",
    "captureName" : "capture",
    "rds" : "rds",
    "db" : "db",
    "mode" : "mode",
    "start_time" : "start_time"
  }
  rep_list = []
  for _, replay in replays_in_progress.items():
    dict_to_add = {field_conversion[field] : replay[field] for field in fields}
    dict_to_add[field_conversion["mode"]] = "fast" if dict_to_add[field_conversion["mode"]] else "time"
    rep_list.append(dict_to_add)
  return { "replays" : rep_list }

def execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, filters, cm):
  ''' Executes a replay asynchronously.

  Arguments:
    credentials - A dictionary containing a region, public_key, and secret_key
    db_id - String, database identifier
    replay_name - String, unique replay name
    capture_name - String, a capture name to base replay off of
    fast_mode - Boolean, True if fast mode, False if time based mode
    restore_db - Boolean, True if restore database after execution
    rds_name - String, RDS identifier
    username - String, database username
    password - String, database password
    filters - String, a newline delineated list of regex patterns where transactions that match any of them are not allowed through
    cm - A ComManager object
  '''
  
  proc = Process(target = _manage_replay,
                 args = (credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, filters, db_in_use, replays_in_progress, lock, ComManager()))
  proc.start()
  _update_replay_count()


def _func_to_call(x): 
      requests.get(x)

def _update_replay_count():
  address = "http://localhost:5000/update_replay_count"
  
  proc = Process(target = _func_to_call,
                 args = (address,))
  proc.start()

def _update_analytics():
  #print("In update_analytics replay", file=sys.stderr)
  address = "http://localhost:5000/update_analytics"
  
  proc = Process(target = _func_to_call,
                 args = (address,))
  proc.start()

def _manage_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, filters, db_in_use, replays_in_progress, lock, cm):
  _place_in_dict(db_id, replay_name, capture_name, fast_mode, restore_db, db_in_use, rds_name, replays_in_progress, lock)
  pid = os.getpid()
  #while (db_id in db_in_use) and (pid != db_in_use[db_id][0]):
  #  time.sleep(3) # sleep three seconds and try again later
  _update_replay_count()
  _execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, filters, cm)
  _remove_from_dict(replay_name, capture_name, db_id, db_in_use, replays_in_progress, lock)
  _update_replay_count()
  _update_analytics() 
 
def _execute_replay(credentials, db_id, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, filters, cm):
  rds_client = cm.get_boto('rds')
  s3_client = cm.get_boto('s3')
  cloudwatch_client = cm.get_boto('cloudwatch')

  hostname = _get_hostname(rds_client, rds_name)
  path_name = capture_name.replace(".cap", "")
  capture_path = "mycrt/" + path_name + "/" + path_name + ".cap"
  transactions = _get_transactions(s3_client, log_key = capture_path)

  start_time, end_time = _execute_transactions(hostname, transactions, fast_mode, db_id, username, password, filters)
  store_all_metrics(start_time, end_time, rds_name, capture_name, replay_name, db_id, fast_mode, cm)

def store_all_metrics(start_time, end_time, rds_name, capture_name, replay_name, db_id, fast_mode, cm):
  s3_client = cm.get_boto('s3')
  cloudwatch_client = cm.get_boto('cloudwatch')

  CPUUtilizationMetric =  _get_metrics(cloudwatch_client, "CPUUtilization", start_time, end_time, rds_name)
  FreeableMemoryMetric = _get_metrics(cloudwatch_client, "FreeableMemory", start_time, end_time, rds_name)
  ReadIOPSMetric = _get_metrics(cloudwatch_client, "ReadIOPS", start_time, end_time, rds_name)
  WriteIOPSMetric = _get_metrics(cloudwatch_client, "WriteIOPS", start_time, end_time, rds_name)

  metrics = {
    "CPUUtilization": CPUUtilizationMetric["Datapoints"],
    "FreeableMemory": FreeableMemoryMetric["Datapoints"],
    "ReadIOPS": ReadIOPSMetric["Datapoints"],
    "WriteIOPS": WriteIOPSMetric["Datapoints"],
    "start_time": datetime.strftime(start_time, "%Y-%m-%d %H:%M:%S"),
    "end_time": datetime.strftime(end_time, "%Y-%m-%d %H:%M:%S"),
    "period": period,
    "db_id": db_id
  }
  #print(metrics, file = sys.stderr)
  _store_metrics(s3_client, metrics, log_key = "mycrt/" + capture_name + "/" + replay_name + ".replay")
 
  query = """INSERT INTO Replays (replay, capture, db, mode, rds, start_time) VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}')""".format(replay_name, capture_name, db_id, "fast" if fast_mode else "time", rds_name, start_time.strftime("%Y/%m/%d %H:%M:%S"))
  cm.execute_query(query)

def stop_replay(credentials, capture_name, replay_name, cm):
  '''Stop an active replay.

  Args:
    credentials: A dictionary resembling the structure at the top of the file
    capture_name: A preexisting capture name
    replay_name: A preexisting replay name
    cm: A communications manager object
  '''
  global lock
  global db_in_use
  global replays_in_progress

  rep_id = capture_name + "/" + replay_name
  replay_in_progress = replays_in_progress[rep_id]
  db_id = replay_in_progress["db"]
  pid = replay_in_progress["pid"]
  try:
    os.kill(pid, signal.SIGTERM)
    _remove_from_dict(replay_name, capture_name, db_id, db_in_use, replays_in_progress, lock)
  except Exception as e:
    print(e, file = sys.stderr)
    print("Process for replay {} has already completed.".format(rep_id), file = sys.stderr)


  # Try to delete incase process got far enough to record any artifacts
  delete_replay(credentials, capture_name, replay_name, cm)
  _update_replay_count()


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
  ''' Returns a list of all completed replays. Issued by a GET request to '/replay/list'

    Returns:
        [
            {
                "replay" : String, 
                "capture" : String, 
                "db" : String, 
                "mode" : String, 
                "rds": String
            }, ...
        ]
  '''
  query = "select replay, capture, db, mode, rds, start_time from Replays where capture <> replay"
  results = cm.execute_query(query)
  replays = [{"replay" : replay, "capture" : capture, "db" : db, "mode" : mode, "rds": rds, "start_time": start_time} for (replay, capture, db, mode, rds, start_time) in results]
  return {"replays" : replays}

def _populate_replay_table(cm):
  table_replays = cm.execute_query("select replay, capture from Replays")
  table_replays = set((capture, replay) for (replay, capture) in table_replays)
  s3_replays = _get_capture_replay_list({"region_name":"us-east-2"}) 
  replays_to_add = set()
  for capture, replays in s3_replays:
    for replay in replays:
      replay = replay.replace(".replay", "")
      if (capture, replay) not in table_replays:
        query = '''INSERT INTO Replays (replay, capture, db, mode, rds) 
                   VALUES ('{0}', '{1}', 'unknown', 'unknown', 'unknown')'''.format(replay, capture)
        cm.execute_query(query)

