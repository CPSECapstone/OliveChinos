import boto3
import pymysql as sql
import os

# One instance of a ComManager object will be used per process
class ComManager:

    # Class level values
    # Will be set in the main mycrt.py upon runtime
    util_db = None
    credentials = None 

    def __init__(self):
        self.boto_conns = {}
        self.sql_conns = {}

    def get_boto(self, service):
        if service not in boto_conns:
            self.boto_conns[service] = boto3.client(service, **(ComManager.credentials))
        return self.boto_conns[service]

    def get_sql(self, db_info = None):
        '''
        db_info : {
            hostname = String, 
            username = String, 
            password = String, 
            database = String
        }
        '''

        if db_info is None:
            db_info = ComManager.util_db
        if db_info["database"] not in sql_conns:
            connection = sql.connect(host = db_info[hostname], 
                                     user = db_info[username], 
                                     passwd = db_info[password], 
                                     db = db_info[database], 
                                     autocommit = True)
            cursor = connection.cursor()
            self.sql_conns[db_info["database"]] = {"conn" : connection, "cur" : cursor}
        return self.sql_conns[db_info["database"]]["cur"]

    def close_sql(self, db_info = None):
        if db_info is None:
            db_info = ComManager.util_db
        if isinstance(db_info, dict):
            db_name = db_info["database"]
        else:
            db_name = db_info
        connection, _ = self.sql_conns[db_name]
        connection.close()