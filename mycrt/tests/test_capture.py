#from server import mycrt
import pytest
import unittest
import requests
import json
from datetime import datetime
#from mycrt import application
from .context import *

#TOTAL NUMBER OF FUNCTIONS FROM CAPTURE FILE: 10
#TOTAL NUMBER OF FUNCTIONS TESTED: 8


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

class TestFlaskApi(unittest.TestCase):
    def setUp(self):
        self.app = server.mycrt.application.test_client()

    def test_get_capture_details_bad(self):
        captureDetails = server.utility.capture.get_capture_details("doesnt_exist")
        expectedDetails = {
            "captureName" : "doesnt_exist",
            "db": "Unknown",
            "endTime": "Unknown",
            "startTime":"Unknown",
            "status":"Unknown"
        }
        self.assertEqual(captureDetails, expectedDetails)

    def test_get_capture_details_good(self):
        captureDetails = server.utility.capture.get_capture_details("initial_capture")
        expectedDetails = {
            "captureName" : "initial_capture",
            "db": "cdb",
            "endTime": "2018-03-14_20:58:13",
            "startTime":"2018-03-14_20:57:19",
            "status":'completed'
        }
        self.assertEqual(captureDetails, expectedDetails)

    def test_capture_name_is_unique_good(self):
        self.assertTrue(server.utility.capture.check_if_capture_name_is_unique("e"))
    
    def test_capture_name_is_unique_bad(self):
       server.utility.capture.start_capture("capture_from_test_file", "customer-rds", "cdb", "2020-10-14_20:57:19", "user", "password")
       self.assertTrue(server.utility.capture.check_if_capture_name_is_unique("capture_from_test_file"))

    def test_get_all_ongoing_capture_details(self):
        ongoingCaptures = server.utility.capture.get_all_ongoing_capture_details()
        expectedOngoing = {
                'captureName': 'capture_from_test_file',
                'db':'cdb',
                'endTime': '2018-03-15_04:01:31',
                'startTime': '2018-03-15_03:30:12',
                'status':'completed'
            }
        self.assertTrue(expectedOngoing in ongoingCaptures)

    def test_cancel_capture(self):
        testerUniqueName = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
        server.utility.capture.schedule_capture(
        testerUniqueName, 
        "cdb", 
        "2020-03-15_04:01:31", 
        "2020-03-15_04:03:31", 
        "customer-rds", 
        "user", 
        "password")
        server.utility.capture.cancel_capture(testerUniqueName)
        scheduledCaptures = server.utility.capture.get_all_scheduled_capture_details()
        expectedScheduled = {
                'captureName': testerUniqueName,
                'db':'cdb',
                'endTime': '2020-03-15_04:03:31',
                'startTime': '2020-03-15_04:01:31',
                'status':'completed'
            }
        self.assertTrue(expectedScheduled not in scheduledCaptures)

    def test_schedule_capture(self):
        testerUniqueName = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
        server.utility.capture.schedule_capture(
        testerUniqueName, 
        "cdb", 
        "2020-03-15_04:01:31", 
        "2020-03-15_04:03:31", 
        "customer-rds", 
        "user", 
        "password")
        self.assertTrue(server.utility.capture.check_if_capture_name_is_unique(testerUniqueName))
        server.utility.capture.cancel_capture(testerUniqueName)

    def test_get_all_scheduled_capture_details(self):
        testerUniqueName = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
        server.utility.capture.schedule_capture(
        testerUniqueName, 
        "cdb", 
        "2020-03-15_04:01:31", 
        "2020-03-15_04:03:31", 
        "customer-rds", 
        "user", 
        "password")
        scheduledCaptures = server.utility.capture.get_all_scheduled_capture_details()
        expectedScheduled = {
                'captureName': testerUniqueName,
                'db':'cdb',
                'endTime': '2020-03-15_04:03:31',
                'startTime': '2020-03-15_04:01:31',
                'status':'completed'
            }
        self.assertTrue(expectedScheduled in scheduledCaptures)
        server.utility.capture.cancel_capture(testerUniqueName)


    

    
