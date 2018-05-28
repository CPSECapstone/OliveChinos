import boto3
import botocore

def verify_login(public_key, secret_key):
  ''' Verifies login information.

  Arguments:
    public_key - String, AWS public key
    secret_key - String, AWS secret key

  Returns:
    Boolean, True if valid, False if not
  '''
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
