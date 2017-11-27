import boto3
import botocore

def verify_login(public_key, secret_key):
  try:
    test_client = boto3.client(
      's3',
      aws_access_key_id = public_key,
      aws_secret_access_key = secret_key,
      region_name = 'us-east-1'
    )

    test_client.list_buckets()

    return True
  except botocore.exceptions.ClientError:
    return False
