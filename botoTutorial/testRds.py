import boto3

# replace with user input
# hard coding is bad
user_access_key_id = 'AKIAIE2W56K7DHZBQO4A'
user_secret_access_key = 'F3TDRcrMu+75HR7OEJSfhtID6Z3tZppPPokQN5gY'

# "rds" is the access point into the user's rds resources
rds = boto3.client(
    'rds', #can change to any compatible aws service 
    aws_access_key_id=user_access_key_id, 
    aws_secret_access_key=user_secret_access_key
)

# see documentation for all available methods
instances = rds.describe_db_instances()

print (instances)

