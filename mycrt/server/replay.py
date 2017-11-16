import pymysql as sql
import boto3
import datetime

hostname = "pi.cwsp4gygmyca.us-east-2.rds.amazonaws.com"
username = "olive"
password = "olivechinos"
database = "CRDB"

# replace with user input
# hard coding is bad
user_access_key_id = 'AKIAIE2W56K7DHZBQO4A'
user_secret_access_key = 'F3TDRcrMu+75HR7OEJSfhtID6Z3tZppPPokQN5gY'

transactionList = ['CREATE TABLE CUSTOMERS(
 ID INT NOT NULL,
 NAME VARCHAR (20) NOT NULL,
 AGE INT NOT NULL,
 ADDRESS CHAR (25),
 ORDERS VARCHAR(155))']
# def retrieveMetrics(connection):
#    cur = connection.cursor()
#    cur.execute("SELECT name, subsystem, status,  FROM INFORMATION_SCHEMA.INNODB_METRICS WHERE status = 'enabled' ORDER BY NAME")

#    for line in cur.fetchall():
#       print(line)
cloudwatch = boto3.resource('cloudwatch')
metric = cloudwatch.Metric('AWS/RDS', 'CPUUtilization')

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

startTime = datetime.datetime.now()
replayTransactions(myConnection, transactionList)
endTime = datetime.datetime.now()

response = metric.get_statistics(
    StartTime=startTime,
    EndTime=endTime,
    Period=5,
)

#retrieveMetrics(myConnection)

print(response)
myConnection.close()

