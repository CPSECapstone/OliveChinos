#from server import mycrt
import pytest
import unittest
import requests
import json
#from mycrt import application
from .context import *


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

def test_simple():
    assert 1 == 1

def test_import():
    assert "Test REST endpoint." == server.mycrt.rest_test()

def test_capture_name_is_unique():
    #assert "Hello." == server.utility.capture.check_if_capture_name_is_unique("e")
    assert True == server.utility.capture.check_if_capture_name_is_unique("e")
# def test_capture
def test_get_all_ongoing_capture_details():
    assert [] == server.utility.capture.get_all_ongoing_capture_details()

def test_login_false():
    assert False == server.utility.login.verify_login("a", "b")


class TestFlaskApi(unittest.TestCase):
    def setUp(self):
        self.app = server.mycrt.application.test_client()

    def test_rest_endpoint(self):
        response = self.app.get('/test')
        responseData = response.data.decode('UTF-8')
        self.assertEqual(responseData, "Test REST endpoint.")
