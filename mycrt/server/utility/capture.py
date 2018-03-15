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

# Default utility connection credentials
# TODO: Remove later
#db_id = "pi"
hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"
region = "us-east-2"

def execute_utility_query(query, hostname = hostname, username = username, password = password, database = database):
  """Executes a query on the utiltity database by default.

  Args:
    query: A SQL query to commit
    hostname: The address/endpoint for the database to connect to
    username: The database username to connect with
    password: The database password to connect with
    database: The database name to connect witheh 

  Returns:
    A list of tuples containing the results of the query. Each element
    in the list is a tuple representing one row and each element of the
    tuple is a value for one column. 
  """

  connection = sql.connect(host = hostname, user = username, passwd = password, db = database, autocommit = True)
  cur = connection.cursor()
  cur.execute(query)
  results = cur.fetchall()
  connection.close()
  return results

def get_all_scheduled_capture_details():
  """Get all scheduled capture details from utility database.

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
    SELECT name from Captures
    WHERE status = "scheduled"
  '''
  results = execute_utility_query(query)
  captures = []
  for (capture_name,) in results:
    captures.append(get_capture_details(capture_name))
  return captures

def get_all_completed_capture_details():
  """Get all completed capture details from utility database.

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
    SELECT name from Captures
    WHERE status = "completed"
  '''
  results = execute_utility_query(query)
  captures = []
  for (capture_name,) in results:
    captures.append(get_capture_details(capture_name))
  return captures



def get_all_ongoing_capture_details():
  """Get all ongoing capture details from utility database.

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
    SELECT name from Captures
    WHERE status = "ongoing"
  '''
  results = execute_utility_query(query)
  captures = []
  for (capture_name,) in results:
    captures.append(get_capture_details(capture_name))
  return captures

  
def get_capture_details(capture_name):
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
    SELECT db, start_time, end_time, status, rds FROM Captures
    WHERE name = '{0}'
  '''.format(capture_name)

  results = execute_utility_query(query)
  if len(results) == 1:
    (db, start_time, end_time, status, rds) = results[0] 
    start_time = start_time.strftime("%Y-%m-%d  %H:%M:%S")
    end_time = "No end time.." if end_time is None else end_time.strftime("%Y-%m-%d  %H:%M:%S")
  else:
    db = "Unknown"
    status = db
    start_time = db
    end_time = db

  return {
    "captureName" : capture_name,
    "db" : db,
    "endTime" : end_time,
    "startTime" : start_time,
    "status" : status,
    "rds": rds
  }  


def check_if_capture_name_is_unique(name):
  """Checks if a capture name is unique

  Returns:
    A True if the name is unqiue, False otherwise
  """
  query = '''select * from Captures where name = '{0}' '''.format(name)
  results = execute_utility_query(query)
  return len(results) == 0

def list_databases(credentials, rds_client = None, close_client = False):
  """Find all databases and create a mapping between the id and endpoints

  Args:
    credentials: A dictionary following the format seen at the top of file
    rds_client: An optional arg that is an opened rds client from Boto3
    close_client: An optional arg that determines if the client will be 
      closed at end of function call

  Returns:
    A dictionary where the keys are the database instance ids available to the user 
    and the values are the associated endpoints.
  """

  if rds_client is None:
    rds_client = boto3.client('rds', **credentials)
  
  instances = rds_client.describe_db_instances()
  
  return {item['DBInstanceIdentifier'] : item['Endpoint']['Address'] for item in instances['DBInstances']}
  

def _create_bucket(s3_client):
  """Creates an S3 bucket to hold captures and metrics.

  TODO: buckets need to be unique and so we should parameterize this for future users 

  Args:
    s3_client: An opened S3 client from Boto3
  """

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
  """Puts information into a bucket

  Args:
    s3_client: An opened S3 client from Boto3
    data: Information to be serialized and stored into the bucket
    bucket_id: The id of the bucket to place the data into
    log_key: The name to give the data once it is inside the bucket
  """

  byte_log = pickle.dumps(data)

  s3_client.put_object(
    Bucket = bucket_id,
    Body = byte_log,
    Key = log_key
  )

def schedule_capture(capture_name, db_name, start_time, end_time, rds_name, username, password):
  """Schedules a capture to be logged into the database.

  """

  print('scheduling capture', file=sys.stderr)
  query = '''INSERT INTO Captures (db, name, start_time, end_time, status, rds, username, password) 
               VALUES ('{0}', '{1}', '{2}', '{3}', "scheduled", '{4}', '{5}', '{6}')'''.format(db_name, capture_name, start_time, end_time, rds_name, username, password)

  execute_utility_query(query)


def start_capture(capture_name, rds_name, db_name, start_time, username, password):
  """Starts a capture.

  No real work is done by this function for now other than marking 
  when a capture was started.

  Args:
    capture_name: Name to give a capture. Assumed to be unqiue
    db_id: Database identifier
  """

  print('starting capture', file=sys.stderr)
  start_time = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
  query = '''INSERT INTO Captures (db, name, start_time, end_time, status, rds, username, password) 
               VALUES ('{0}', '{1}', '{2}', NULL, "ongoing", '{3}', '{4}', '{5}') ON DUPLICATE KEY UPDATE status="ongoing"'''.format(db_name, capture_name, start_time, rds_name, username, password)
  execute_utility_query(query)

def end_capture(credentials, capture_name, db):
  """Ends a specified capture.

  Args:
    credentials: A dictionary resembling the structure at the top of the file
    capture_name: A preexisting capture name
    db_id: Database identifier
  """

  print('ending capture', file=sys.stderr)
  end_time = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
  execute_utility_query('''UPDATE Captures SET end_time = '{0}', status = "completed" WHERE name = '{1}' '''.format(end_time, capture_name))
  # Unpack results to get start and end time from the capture we are finishing
  query = '''SELECT start_time, rds, username, password FROM Captures WHERE name = '{0}' '''.format(capture_name)
  query_res = execute_utility_query(query) 
  start_time, rds, username, password = query_res[0]
  s3_client = boto3.client('s3', **credentials)
  
  databases = list_databases(credentials)
  address = databases[rds]
  
  query = '''
      SELECT event_time, argument 
      FROM mysql.general_log 
      WHERE user_host <> 'rdsadmin[rdsadmin] @ localhost [127.0.0.1]'
      AND event_time >= '{0}' AND event_time <= '{1}'
      AND command_type = 'Query'
  '''.format(start_time.strftime("%Y/%m/%d %H:%M:%S"), end_time)

  transactions = execute_utility_query(query, hostname = address, username = username, password = password, database = db) # need to give username and password eventually

  bucket_id = "my-crt-test-bucket-olive-chinos"
  _put_bucket(s3_client, transactions, bucket_id, log_key = "{0}/{0}.cap".format(capture_name))

  query = ''' UPDATE Captures SET username = "", password = "" WHERE name = '{0}' '''.format(capture_name)
  execute_utility_query(query)

  return start_time

def delete_capture(credentials, capture_name):
  '''Remove all traces of a capture in both S3 and the utility db.

  Code referenced from here: https://stackoverflow.com/questions/33104579/boto3-s3-folder-not-getting-deleted

  Args:
    credentials: A dictionary resembling the structure at the top of the file
    capture_name: A preexisting capture name
  '''

  s3_resource = boto3.resource('s3', **credentials)
  bucket_id = "my-crt-test-bucket-olive-chinos"
  bucket = s3_resource.Bucket(bucket_id)  

  objects_to_delete = []
  for obj in bucket.objects.filter(Prefix = capture_name + '/'):
    objects_to_delete.append({'Key': obj.key})

  bucket.delete_objects(
    Delete = {
        'Objects': objects_to_delete
    }
  )

  query = '''DELETE FROM Captures WHERE name = '{0}' '''.format(capture_name)
  execute_utility_query(query)

def cancel_capture(capture_name): 
    '''Remove scheduled or ongoing capture from database
    
    As long as the capture has not completed, there should be no S3 bucket for it so the only artifacts 
    that need to be removed are in the utility db.

    Args: 
        capture_name: A preexisting capture name
    '''

    query = '''DELETE FROM Captures WHERE name = '{0}' '''.format(capture_name)
    execute_utility_query(query)
    



