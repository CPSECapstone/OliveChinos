import boto3
import pymysql as sql
import sqlite3 as util_sql
import os

# One instance of a ComManager object will be used per process
class ComManager:

    # Class level values
    # Will be set in the main mycrt.py upon runtime
    S3name = None
    credentials = None 

    def __init__(self):
        self.boto_conns = {}
        self.sql_conns = {}

    def get_boto(self, service):
        if service not in self.boto_conns:
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
            connection = util_sql.connect('util.db', isolation_level = None) # autocommit on by default
            cursor = connection.cursor()
            self.sql_conns['util.db'] = {"conn" : connection, "cur" : cursor}
            db_info = {"database" : 'util.db'}
        elif db_info["database"] not in self.sql_conns:
            connection = sql.connect(host = db_info["hostname"], 
                                     user = db_info["username"], 
                                     passwd = db_info["password"], 
                                     db = db_info["database"], 
                                     autocommit = True)
            cursor = connection.cursor()
            self.sql_conns[db_info["database"]] = {"conn" : connection, "cur" : cursor}
        return self.sql_conns[db_info["database"]]["cur"]

    def close_sql(self, db_info = None):
        if db_info is None:
            db_info = 'util.db'
        if isinstance(db_info, dict):
            db_name = db_info["database"]
        else:
            db_name = db_info
        connection, _ = self.sql_conns[db_name]
        connection.close()

    def execute_query(self, query, **kwargs):
        """Executes a query on a cursor.

        Args:
            query: A SQL query to commit
            cursor: The cursor pointing to a database to execute on

        Returns:
            A list of tuples containing the results of the query. Each element
            in the list is a tuple representing one row and each element of the
            tuple is a value for one column. 
        """
        if (kwargs == {}) or ("hostname" not in kwargs) or ("username" not in kwargs) or ("password" not in kwargs) or ("database" not in kwargs):
            db_info = None
        else:
            db_info = kwargs

        cursor = self.get_sql(db_info)
        cursor.execute(query)
        results = cursor.fetchall()
        return results

    def setup_utility_database(self):
        capture_command = '''
            CREATE TABLE Captures (
            db text DEFAULT NULL,
            name text NOT NULL DEFAULT '',
            start_time text DEFAULT NULL,
            end_time text DEFAULT NULL,
            status text DEFAULT NULL,
            rds text DEFAULT NULL,
            username text DEFAULT NULL,
            password text DEFAULT NULL,
            PRIMARY KEY (name))
        '''
        replays_command = '''
            CREATE TABLE Replays (
            replay varchar(255) NOT NULL DEFAULT '',
            capture varchar(255) NOT NULL DEFAULT '',
            db varchar(255) DEFAULT NULL,
            mode varchar(16) DEFAULT NULL,
            rds varchar(255) DEFAULT NULL,
            PRIMARY KEY (replay,capture))
        '''

        cursor = self.get_sql()
        cursor.execute(capture_command)
        cursor.execute(replays_command)