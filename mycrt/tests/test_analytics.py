#from server import mycrt
import pytest
import unittest
import requests
import json
from datetime import datetime
#from mycrt import application
from .context import *

#TOTAL NUMBER OF FUNCTIONS FROM ANALYTICS FILE: 5
#TOTAL NUMBER OF FUNCTIONS TESTED: 0


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
    

    
