import boto3
import pickle
import sys

def get_capture_list(credentials, cm):
  s3_client = cm.get_boto('s3')
  key_list = [key['Key'] for key in s3_client.list_objects(Bucket="my-crt-test-bucket-olive-chinos")['Contents'] if "/" in key['Key']]
  key_list = list(set(key.split("/")[0] for key in key_list)) # Ensure unique keys, but return in list format
  return key_list

def get_replays_for_capture(credentials, capture_folder, cm):
  s3_client = cm.get_boto('s3')
  key_len = len(capture_folder)
  key_list = [key['Key'] for key in s3_client.list_objects(Bucket="my-crt-test-bucket-olive-chinos")['Contents']]
  general_capture_list = [key for key in key_list if key != capture_folder and key[:key_len] == capture_folder]
  replay_list = [key for key in general_capture_list if ".replay" == key[-len(".replay"):]] 
  return replay_list

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
  metrics = {}
  capture_list = get_capture_list(credentials, cm)
  for capture in capture_list:
    replay_list = get_replays_for_capture(credentials, capture, cm)
    metrics[capture] = {replay.replace(capture, "").replace("/", "").replace(".replay", ""): retrieve_analytics(s3_client, log_key = replay) for replay in replay_list}
  
  return metrics

def retrieve_analytics(s3_client, bucket_id = "my-crt-test-bucket-olive-chinos", log_key = "test-folder/test-metrics"):
  bucket_obj = s3_client.get_object(
    Bucket = bucket_id,
    Key = log_key
  )
  new_byte_log = bucket_obj["Body"].read()
  metrics = pickle.loads(new_byte_log)

  return metrics
