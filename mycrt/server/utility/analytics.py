import boto3
import pickle
import sys
from .communications import ComManager

def get_capture_list(credentials, cm):
  cap_name_query = '''SELECT name FROM Captures WHERE status = "completed"'''
  cap_names = cm.execute_query(cap_name_query)
  return cap_names

# Deprecated
def get_replays_for_capture(credentials, capture_folder, cm):
  s3_client = cm.get_boto('s3')
  key_len = len(capture_folder)
  bucket_id = ComManager.S3name
  key_list = [key['Key'] for key in s3_client.list_objects(Bucket=bucket_id)['Contents']]
  general_capture_list = [key for key in key_list if key != capture_folder and key[:key_len] == capture_folder]
  replay_list = [key for key in general_capture_list if ".replay" == key[-len(".replay"):]] 
  return replay_list

# Deprecated
def get_capture_replay_list(credentials, cm):
  ret_list = []
  s3_client = cm.get_boto('s3')
  capture_list = get_capture_list(credentials, cm)
  for capture in capture_list:
    replay_list = [replay.replace(capture, "").replace("/", "") for replay in get_replays_for_capture(credentials, capture, cm)]
    if len(replay_list) > 0:
      ret_list.append((capture, replay_list))

  return ret_list

def get_analytics(credentials, cm):
  s3_client = cm.get_boto('s3')
  cap_names = get_capture_list(credentials, cm)
  rep_cap_name_query = '''SELECT replay, capture FROM Replays'''
  rep_cap_names = cm.execute_query(rep_cap_name_query)
  metrics = {capture_name : {} for (capture_name,) in cap_names}
  #capture_list = get_capture_list(credentials, cm)
  
  top_folder = "mycrt/"
  for (replay_name, capture_name) in rep_cap_names:
    key = top_folder + capture_name + "/" + replay_name + ".replay"
    metrics[capture_name][replay_name] = retrieve_analytics(s3_client, log_key = key)
  #for capture in capture_list:
  #  replay_list = get_replays_for_capture(credentials, capture, cm)
  #  metrics[capture] = {replay.replace(capture, "").replace("/", "").replace(".replay", ""): retrieve_analytics(s3_client, log_key = replay) for replay in replay_list}
  
  return metrics

def retrieve_analytics(s3_client, bucket_id = None, log_key = "test-folder/test-metrics"):
  if bucket_id is None:
    bucket_id = ComManager.S3name
    
  bucket_obj = s3_client.get_object(
    Bucket = bucket_id,
    Key = log_key
  )
  new_byte_log = bucket_obj["Body"].read()
  metrics = pickle.loads(new_byte_log)

  return metrics
