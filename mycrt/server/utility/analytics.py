import boto3
import pickle
import sys

def get_analytics(credentials):
  analytics = "Pretend this is some analytics Data"
  region = credentials['region_name']
  s3_client = boto3.client('s3', **credentials)
  metrics = retrieve_analytics(s3_client)

  return metrics

def retrieve_analytics(s3_client, bucket_id = "my-crt-test-bucket-olive-chinos", log_key = "test-metrics"):
  bucket_obj = s3_client.get_object(
    Bucket = bucket_id,
    Key = log_key
  )
  new_byte_log = bucket_obj["Body"].read()
  metrics = pickle.loads(new_byte_log)

  print ("\n\n\n\n", file=sys.stderr)

  

  print (metrics, file=sys.stderr)


  return metrics
