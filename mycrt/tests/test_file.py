#from server import mycrt
import pytest
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
    assert "Pretend this is some analytics Data" == server.mycrt.analytics()
