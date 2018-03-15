#from server import mycrt
import pytest
import unittest
import requests
import json
from datetime import datetime
from .context import *

#TOTAL NUMBER OF FUNCTIONS FROM SCHEDULER FILE: 7
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

class TestFlaskApi(unittest.TestCase):
    def setUp(self):
        self.app = server.mycrt.application.test_client()
    
    #TODO: Fix this, not possible without credentials
#     def test_remove_from_scheduled_captures(self):
#         testerUniqueName = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
#         server.utility.capture.schedule_capture(
#         testerUniqueName, 
#         "cdb", 
#         "2020-03-15_04:01:31", 
#         "2020-03-15_04:03:31", 
#         "customer-rds", 
#         "user", 
#         "password")
#         server.utility.scheduler._remove_from_scheduled_captures()

    def test_get_epoch_time(self):
        testRaw = datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S")
        dt_obj = datetime.strptime(testRaw, '%Y-%m-%dT%H:%M:%S.%fZ')
        eight_hours = timedelta(hours=7).total_seconds()
        expectedTime = time.mktime(dt_obj.timetuple()) - eight_hours
        testerTime = server.utility.scheduler._get_epoch_time(testRaw)
        self.assertEquals(testerTime, expectedTime)


