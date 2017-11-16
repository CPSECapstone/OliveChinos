import pymysql as sql
import boto3
import datetime

transactionList = ['SELECT * FROM users', 'SELECT * FROM users', 'SELECT * FROM users', 'SELECT * FROM users']
# def retrieveMetrics(connection):
#    cur = connection.cursor()
#    cur.execute("SELECT name, subsystem, status,  FROM INFORMATION_SCHEMA.INNODB_METRICS WHERE status = 'enabled' ORDER BY NAME")

#    for line in cur.fetchall():
#       print(line)

s3Client = boto3.client(
   's3',
   aws_access_key_id = user_access_key_id,
   aws_secret_access_key = user_secret_access_key,
   region_name = region)

cloudwatch_client = boto3.client(
   'cloudwatch',
   aws_access_key_id = user_access_key_id,
   aws_secret_access_key = user_secret_access_key,
   region_name = region)

#metric = cloudwatch_client.Metric('AWS/RDS', 'CPUUtilization')

def replayTransactions(connection, transactions):
   cur = connection.cursor()

   for transaction in transactions:
      cur.execute(transaction)


# # "rds" is the access point into the user's rds resources
# rds = boto3.client(
#     'rds', #can change to any compatible aws service 
#     aws_access_key_id=user_access_key_id, 
#     aws_secret_access_key=user_secret_access_key
# )

# instances = rds.describe_db_instances()

# print (instances)

myConnection = sql.connect(host = hostname, user = username, passwd = password, db = database)

startTime = datetime.datetime.utcnow() - datetime.timedelta(minutes = 60)
replayTransactions(myConnection, transactionList)
endTime = datetime.datetime.utcnow()

response = cloudwatch_client.get_metric_statistics(
    Namespace='AWS/RDS',
    MetricName='FreeableMemory',
    Dimensions = [{
         "Name" : "DBInstanceIdentifier",
         "Value" : "pi"
    }],
    StartTime=startTime,
    EndTime=endTime,
    Period=60,
    Statistics=[
        'Average'
    ]
)

#retrieveMetrics(myConnection)

print(response)
myConnection.close()

