import pytest
import unittest
import requests
import subprocess
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

from .context import *

wait = None

@pytest.mark.usefixtures('driver_init')
class TestGUI(unittest.TestCase): 

    def test_login(self): 
        wait = WebDriverWait(self.driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Login')))
        self.driver.find_element_by_id('loginUsername').send_keys('abc')
        self.driver.find_element_by_id('loginPassword').send_keys('123')
        self.driver.find_element_by_id('appLoginButton').click()

        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'react-bs-table-no-data')))

    def test_capture(self): 
        wait = WebDriverWait(self.driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Login')))
        self.driver.find_element_by_id('loginUsername').send_keys('abc')
        self.driver.find_element_by_id('loginPassword').send_keys('123')
        self.driver.find_element_by_id('appLoginButton').click()

        #create new capture
        wait.until(EC.presence_of_element_located((By.ID, 'newCaptureBtn')))
        self.driver.find_element_by_id('newCaptureBtn').click()
        wait.until(EC.presence_of_element_located((By.ID, 'dbNameInput')))

        self.driver.find_element_by_id('dbNameInput').send_keys('cdb')
        self.driver.find_element_by_id('dbUsernameInput').send_keys('user')
        self.driver.find_element_by_id('dbpasswordInput').send_keys('password')

        self.driver.find_element_by_id('submitNewCaptureBtn').click()
        
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'stopActiveCapBtn')))

    def test_delete_capture(self): 
        #Login
        wait = WebDriverWait(self.driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Login')))
        self.driver.find_element_by_id('loginUsername').send_keys('abc')
        self.driver.find_element_by_id('loginPassword').send_keys('123')
        self.driver.find_element_by_id('appLoginButton').click()

        #delete capture 
        self.driver.find_element_by_class_name('stopActiveCapBtn').click()

        if (driver.find_elements_by_class_name('stopActiveCapBtn').size() > 0)
            assert 0

    def test_replay(self):
        #Login
        wait = WebDriverWait(self.driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Login')))
        self.driver.find_element_by_id('loginUsername').send_keys('abc')
        self.driver.find_element_by_id('loginPassword').send_keys('123')
        self.driver.find_element_by_id('appLoginButton').click()

        #Navigate to replay page
        self.driver.find_element_by_id('replayTabBtn').click()

        #Create new replay
        self.driver.find_element_by_id('newReplayBtn').click()
        wait.until(EC.presence_of_element_located((By.ID, 'replayDbNameInput')))

        self.driver.find_element_by_id('replayDbNameInput').send_keys('cdb')
        self.driver.find_element_by_id('replayUsernameInput').send_keys('user')
        self.driver.find_element_by_id('replayPasswordInput').send_keys('password')

        self.driver.find_element_by_id('startReplayButton').click()

       
    def test_logout(self): 
        #Login
        wait = WebDriverWait(self.driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Login')))
        self.driver.find_element_by_id('loginUsername').send_keys('abc')
        self.driver.find_element_by_id('loginPassword').send_keys('123')
        self.driver.find_element_by_id('appLoginButton').click()

        #Logout
        self.driver.find_element_by_id('userLogo').click()
        self.driver.find_element_by_id('logoutButton').click()

        #make sure back on the home page
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Login')))



