import pickle
import pymysql as sql
import boto3
from datetime import datetime, timedelta
import time
import re
import sys
import requests
from .communications import ComManager
from .replay import store_all_metrics, _update_replay_count, _get_transactions
from multiprocessing import Process




# Example of credentials dictionary
'''
credentials = {
  "aws_access_key" : access_key,
  "aws_secret_access_key" : secret_key,
  "region_name" : region
}
'''

# Default utility connection credentials
# TODO: Remove later
#db_id = "pi"
hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"
region = "us-east-2"

def get_all_scheduled_capture_details(cm):
  """Get all scheduled capture details from utility database.

  Arguments:
    cm: A ComManager object

  Returns: 
    A list containing details of captures that are ongoing.
    These details are represented by a dictionary. The dictionary
    will have the following format:
      {
        "captureName" : String,
        "db" : String,
        "endTime" : None,
        "startTime" : String,
        "status" : Boolean
      } 
  """

  # FIX LATER (is inefficient)
  query = '''
    SELECT name, db, start_time, end_time, status, endpoint FROM Captures
    WHERE status = "scheduled"
  '''
  results = cm.execute_query(query)
  captures = [_process_capture_details(record) for record in results]
  return captures

def get_all_completed_capture_details(cm):
  """Get all completed capture details from utility database.

  Arguments:
    cm: A ComManager object

  Returns: 
    A list containing details of captures that are ongoing.
    These details are represented by a dictionary. The dictionary
    will have the following format:
      {
        "captureName" : String,
        "db" : String,
        "endTime" : None,
        "startTime" : String,
        "status" : Boolean
      } 
  """

  # FIX LATER (is inefficient)
  query = '''
    SELECT name, db, start_time, end_time, status, endpoint FROM Captures
    WHERE status = "completed"
  '''
  results = cm.execute_query(query)
  captures = [_process_capture_details(record) for record in results]
  return captures

def get_all_ongoing_capture_details(cm):
  """Get all ongoing capture details from utility database.

  Arguments:
    cm - A ComManager object

  Returns:
    A list containing details of captures that are ongoing.
    These details are represented by a dictionary. The dictionary
    will have the following format:
      {
        "captureName" : String,
        "db" : String,
        "endTime" : None,
        "startTime" : String,
        "status" : Boolean
      } 
  """

  query = '''
    SELECT name, db, start_time, end_time, status, endpoint FROM Captures
    WHERE status = "ongoing"
  '''
  results = cm.execute_query(query)
  captures = [_process_capture_details(record) for record in results]
  return captures

  
def get_capture_details(capture_name, cm):
  """Returns the details of a single capture.

  Returns:
    A dictionary containing the details of a capture with the 
    following format:
      {
        "captureName" : String,
        "db" : String,
        "endTime" : None,
        "startTime" : String,
        "status" : Boolean
      } 
  """  

  query = '''
    SELECT name, db, start_time, end_time, status, endpoint FROM Captures
    WHERE name = '{0}'
  '''.format(capture_name)

  results = cm.execute_query(query)
  if len(results) == 1:
    return _process_capture_details(results[0])
  else:
    db = "Unknown"
    status = "Unknown"
    start_time = "Unknown"
    end_time = "Unknown"
    endpoint = "Unkown"

    return {
      "captureName" : capture_name,
      "db" : db,
      "endTime" : end_time,
      "startTime" : start_time,
      "status" : status,
      "rds": endpoint #TODO Change "rds" to "endpoint"
    }  

def _func_to_call(x): 
  requests.get(x)

def _update_capture_count():
  address = "http://localhost:5000/update_capture_count"
  
  proc = Process(target = _func_to_call,
                 args = (address,))
  proc.start()

def _update_analytics():
  print("In update_analytics", file=sys.stderr)
  address = "http://localhost:5000/update_analytics"
  
  proc = Process(target = _func_to_call,
                 args = (address,))
  proc.start()
 
def _process_capture_details(record):
  (name, db, start_time, end_time, status, endpoint) = record

  #start_time = 'No start time.' if not hasattr(start_time, 'strftime') else start_time.strftime("%Y-%m-%d  %H:%M:%S")
  #end_time = "No end time." if ((end_time is None) or (not hasattr(end_time, 'strftime'))) else end_time.strftime("%Y-%m-%d  %H:%M:%S")
  start_time = start_time.replace("/", "-")#start_time.strftime("%Y-%m-%d  %H:%M:%S")
  start_time = _convert_time(start_time, 'PST')
  end_time = "No end time." if end_time is None else _convert_time(end_time.replace("/", "-"), 'PST')#end_time.strftime("%Y-%m-%d  %H:%M:%S")

  return {
    "captureName" : name,
    "db" : db,
    "endTime" : end_time,
    "startTime" : start_time,
    "status" : status,
    "rds": endpoint #TODO Change "rds" to "endpoint"
  }  
 
def _convert_time(time, time_zone): 
  time = datetime.strptime(time, "%Y-%m-%d  %H:%M:%S")
  tz_offset = timedelta(hours=7)
  time = time - tz_offset
  return time.strftime("%Y-%m-%d  %H:%M:%S")


def get_capture_number(cm):
  ''' Returns the number of ongoing captures.

  Arguments:
    cm - A ComManager object

  Returns:
    Integer
  '''
  query = '''
    SELECT COUNT(*) from Captures
    WHERE status = "ongoing"
  '''
  results = cm.execute_query(query)
  return results[0][0]

def check_if_capture_name_is_unique(name, cm):
  """Checks if a capture name is unique.

  Arguments:
    name - A String representing the capture name
    cm - A ComManager object

  Returns:
    A True if the name is unqiue, False otherwise
  """
  query = '''select * from Captures where name = '{0}' '''.format(name)
  results = cm.execute_query(query)
  return len(results) == 0


def _create_bucket(s3_client):
  """Creates an S3 bucket to hold captures and metrics.

  TODO: buckets need to be unique and so we should parameterize this for future users 

  Arguments:
    s3_client: An opened S3 client from Boto3
  """

  bucket_id = ComManager.S3name
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

def _put_bucket(s3_client, data, bucket_id, log_key = "test-log.txt", cm = None):
  """Puts information into a bucket

  Args:
    s3_client: An opened S3 client from Boto3
    data: Information to be serialized and stored into the bucket
    bucket_id: The id of the bucket to place the data into
    log_key: The name to give the data once it is inside the bucket
  """
  if cm is None:
    raise Exception("Must give a communications manager object")
  byte_log = pickle.dumps(data)

  s3_client.put_object(
    Bucket = bucket_id,
    Body = byte_log,
    Key = log_key
  )

def _process_time(time_str):
  if "T" in time_str:
    '%Y-%m-%dT%H:%M:%S.%fZ'
    macro, micro = time_str.split("T")
    year, month, day = macro.split("-")
    hms = micro.split(".")[0] #HH:MM:SS
    return "{0}/{1}/{2} {3}".format(year, month, day, hms)
  else:
    return time_str

def schedule_capture(capture_name, db_name, start_time, end_time, endpoint, rds_name, username, password, filters, cm):
  """Schedules a capture to be logged into the database.

  Arguments:
    capture_name - String representing capture name
    db_name - String representing database name
    start_time - DateTime object containing starttime for capture 
    end_time - DateTime object containing endtime for capture
    endpoint - String representing database endpoint
    username - String representing database username
    password - String representing database password
    cm - A ComManager object

  """
  start_time = _process_time(start_time)
  end_time = _process_time(end_time)
  print('scheduling capture', file=sys.stderr)
  query = '''INSERT INTO Captures (db, name, start_time, end_time, status, endpoint, username, password, rds, filters) 
               VALUES ('{0}', '{1}', '{2}', '{3}', "scheduled", '{4}', '{5}', '{6}', '{7}', '{8}')'''.format(db_name, capture_name, start_time, end_time, endpoint, username, password, rds_name, filters)

  cm.execute_query(query)
  _update_capture_count()
  _update_analytics()
  


def start_capture(capture_name, endpoint, rds_name, db_name, start_time, username, password, filters, cm):
  """Starts a capture.

  No real work is done by this function for now other than marking 
  when a capture was started.

  Arguments:
    capture_name: String, Name to give a capture. Assumed to be unqiue
    endpoint: String, represents the endpoint of database
    db_name: String, Database identifier
    start_time: DateTime, for when the capture starts
    username: String, username for database
    password: String, password for database
    filters: String, a newline delineated list of regex patterns where transactions that match any of them are not allowed through
    cm: A ComManager object
  """

  print('starting capture', file=sys.stderr)
  start_time = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
  query = '''UPDATE OR IGNORE Captures SET status="ongoing" WHERE name="{0}"'''.format(capture_name)
  cm.execute_query(query)
  query = '''INSERT OR IGNORE INTO Captures (db, name, start_time, end_time, status, endpoint, username, password, rds, filters) 
               VALUES ('{0}', '{1}', '{2}', NULL, "ongoing", '{3}', '{4}', '{5}', '{6}', '{7}')'''.format(db_name, capture_name, start_time, endpoint, username, password, rds_name, filters)
  cm.execute_query(query)
  _update_capture_count()

def end_capture(credentials, capture_name, db, cm):
  """Ends a specified capture.

  Arguments:
    credentials: A dictionary resembling the structure at the top of the file
    capture_name: A preexisting capture name
    db: Database identifier
    cm: A ComManager object
  """

  print('ending capture', file=sys.stderr)
  end_time = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
  cm.execute_query('''UPDATE Captures SET end_time = '{0}', status = "completed" WHERE name = '{1}' '''.format(end_time, capture_name))
  # Unpack results to get start and end time from the capture we are finishing
  query = '''SELECT start_time, endpoint, username, password, rds, filters FROM Captures WHERE name = '{0}' '''.format(capture_name)
  query_res = cm.execute_query(query) 
  start_time, endpoint, username, password, rds_name, filters = query_res[0]
  s3_client = cm.get_boto('s3')
  
  #databases = cm.list_databases()
  #address = databases[rds]
   
  query = '''
      SELECT event_time, argument 
      FROM mysql.general_log 
      WHERE user_host <> 'rdsadmin[rdsadmin] @ localhost [127.0.0.1]'
      AND event_time >= '{0}' AND event_time <= '{1}'
      AND command_type = 'Query'
  '''.format(start_time, end_time)

  # process filters
  if filters != "" and filters is not None:
    filters_to_add = " AND ".join(["argument NOT REGEXP '{}'".format(f) for f in filters.split("\n")])
    query += " AND " + filters_to_add

  db_info = dict(hostname = endpoint, username = username, password = password, database = db)
  transactions = cm.execute_query(query, **db_info) # need to give username and password eventually
  #cm.close_sql(db_info = db_info) Not needed anymore
  
  bucket_id = ComManager.S3name

  _put_bucket(s3_client, transactions, bucket_id, log_key = "mycrt/{0}/{0}.cap".format(capture_name), cm = cm)

  query = ''' UPDATE Captures SET username = "", password = "" WHERE name = '{0}' '''.format(capture_name)
  cm.execute_query(query)

  if rds_name != "":
    store_all_metrics(start_time = datetime.strptime(start_time, "%Y/%m/%d %H:%M:%S"), 
                      end_time = datetime.strptime(end_time, "%Y/%m/%d %H:%M:%S"), 
                      rds_name = rds_name, 
                      capture_name = capture_name, 
                      replay_name = capture_name, 
                      db_id = db, 
                      fast_mode = False, 
                      cm = cm)
    _update_replay_count()

  _update_capture_count()
  _update_analytics()
  return start_time

def delete_capture(credentials, capture_name, cm):
  '''Remove all traces of a capture in both S3 and the utility db.

  Code referenced from here: https://stackoverflow.com/questions/33104579/boto3-s3-folder-not-getting-deleted

  Arguments:
    credentials: A dictionary resembling the structure at the top of the file
    capture_name: A preexisting capture name
    cm: A ComManager object
  '''

  s3_client = cm.get_boto('s3')
  bucket_id = cm.S3name

  objects_to_delete = [{"Key" : "mycrt/" + capture_name + '/' + capture_name + ".cap"}]
  query = '''SELECT replay FROM Replays WHERE capture = '{0}' '''.format(capture_name)
  for (replay_name,) in cm.execute_query(query):
    objects_to_delete.append({"Key" : "mycrt/" + capture_name + '/' + replay_name + ".replay"})
  #for obj in bucket.objects.filter(Prefix = "mycrt/" + capture_name + '/'):
  #  objects_to_delete.append({'Key': obj.key})

  s3_client.delete_objects(
    Bucket = bucket_id, 
    Delete = {
        'Objects': objects_to_delete
    }
  )

  query = '''DELETE FROM Captures WHERE name = '{0}' '''.format(capture_name)
  cm.execute_query(query)
  query = '''DELETE FROM Replays WHERE capture = '{0}' '''.format(capture_name)
  cm.execute_query(query)

def cancel_capture(capture_name, cm): 
  '''Remove scheduled or ongoing capture from database
  
  As long as the capture has not completed, there should be no S3 bucket for it so the only artifacts 
  that need to be removed are in the utility db.

  Arguments: 
      capture_name: A preexisting capture name
      cm: A ComManager object
  '''

  query = '''DELETE FROM Captures WHERE name = '{0}' '''.format(capture_name)
  cm.execute_query(query)
  _update_capture_count()

def get_capture_transactions(capture_name, cm):
  ''' Get a timestamped list of transactions executed from a capture.

  Arguments: 
    capture_name: A preexisting capture name
    cm: A ComManager object    

  Returns:
    [String, ...], A list of strings each in the format of "<TIMESTAMP> <TRANSACTION>"
  '''
  s3_client = cm.get_boto('s3')
  capture_path = "mycrt/" + capture_name + "/" + capture_name + ".cap"
  transactions = _get_transactions(s3_client, log_key = capture_path)
  transactions = list(transactions)
  transactions.sort(key = lambda x: x[0])
  if isinstance(transactions[0][0], str):
    return [c_time + " " + re.sub( '\s+', ' ', trans).strip() for c_time, trans in transactions]
  else:
    return [c_time.strftime("%Y-%m-%d %H:%M:%S") + " " + re.sub( '\s+', ' ', trans).strip() for c_time, trans in transactions]

