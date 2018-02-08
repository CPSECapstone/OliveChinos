import boto3
import pickle
import sys

def get_capture_list(credentials):
  s3_client = boto3.client('s3', **credentials)
  key_list = [key['Key'] for key in s3_client.list_objects(Bucket="my-crt-test-bucket-olive-chinos")['Contents'] if "/" in key['Key']]
  key_list = list(set(key.split("/")[0] for key in key_list)) # Ensure unique keys, but return in list format
  return key_list

def get_replays_for_capture(credentials, capture_folder):
  s3_client = boto3.client('s3', **credentials)
  key_len = len(capture_folder)
  key_list = [key['Key'] for key in s3_client.list_objects(Bucket="my-crt-test-bucket-olive-chinos")['Contents']]
  general_capture_list = [key for key in key_list if key != capture_folder and key[:key_len] == capture_folder]
  replay_list = [key for key in general_capture_list if ".replay" == key[-len(".replay"):]] 
  return replay_list

def get_analytics(credentials):
  analytics = "Pretend this is some analytics Data"
  region = credentials['region_name']
  s3_client = boto3.client('s3', **credentials)
  metrics = {}
  capture_list = get_capture_list(credentials)
  for capture in capture_list:
    replay_list = get_replays_for_capture(credentials, capture)
    metrics[capture[:-1]] = {replay.replace(capture, "") : retrieve_analytics(s3_client, log_key = replay) for replay in replay_list}
  
  return metrics

def retrieve_analytics(s3_client, bucket_id = "my-crt-test-bucket-olive-chinos", log_key = "test-folder/test-metrics"):
  bucket_obj = s3_client.get_object(
    Bucket = bucket_id,
    Key = log_key
  )
  new_byte_log = bucket_obj["Body"].read()
  metrics = pickle.loads(new_byte_log)

  print ("\n\n\n\n", file=sys.stderr)

  

  print (metrics, file=sys.stderr)


  return metrics
