import pytest
import unittest
import requests
import subprocess
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

from .context import *

@pytest.mark.usefixtures('driver_init')
class TestGUI(unittest.TestCase): 

    def test_start(self): 
        wait = WebDriverWait(self.driver, 20)
        self.driver.get('http://0.0.0.0:5000')
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Login')))

        inputUsername = self.driver.find_element_by_css_selector("//*[@id='content']/div/div/div[1]/div/div[2]/form/input[1]")
        inputUsername.send_keys('lofti')
        inputPassword = self.driver.find_element_by_css_selector("//*[@id='content']/div/div/div[1]/div/div[2]/form/input[2]")
        inputPassword.send_keys('password')

        self.driver.find_element_by_css_selector("//*[@id='content']/div/div/div[1]/div/div[2]/form/div/button").click()

