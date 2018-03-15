#from server import mycrt
import pytest
import unittest
import requests
import json
from datetime import datetime
import boto3
from .context import *

#TOTAL NUMBER OF FUNCTIONS FROM REPLAY FILE: 15
#TOTAL NUMBER OF FUNCTIONS TESTED: 1


"""
if __name__ == '__main__':

    if __package__ is None:
        import sys
        from os import path
        sys.path.append( path.dirname( path.dirname( path.abspath(__file__) ) ) )
        from server.mycrt import *
    else:
        from ..server.mycrt import *
"""
#mock class for the RDS Client
class FakeRDSClient():
    db_id = "blackfoot-rds"
    def describe_db_instances(DBInstanceIdentifier):
        return {
            'DBInstances':[{
                'Endpoint': [
                    {'Address': 'test'}
                ]
            }]
        }

class TestFlaskApi(unittest.TestCase):
    def setUp(self):
        self.app = server.mycrt.application.test_client()
#Do not work without credentials currently
#TODO: Fix this test
    # def test_get_active_db(self):
    #     fakeRDSClient = FakeRDSClient()
    #     hostname = server.utility.replay._get_hostname(fakeRDSClient, "blackfoot-rds")
    #     print('heerree')
        # print(hostname)

    # def test_get_active_db(self):
    #     test = server.utility.replay.get_active_replays()
    #     print('HERE')
    #     print(test)

    def test_get_replays_from_table(self):
        tester = server.utility.replay.get_replays_from_table()
        exprectedReplays = {
            "replay":[{
                "replay" : 'test_replay', 
                "capture" : 'test_capture', 
                "db" : 'cdb', 
                "mode" : 'fast'
            }]
        }
        print('HERE')
        print(tester)


    
