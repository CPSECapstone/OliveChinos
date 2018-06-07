import pytest

@pytest.fixture(scope='session')
def driver_init(request): 
    from selenium import webdriver
    web_driver = webdriver.Chrome()
    web_driver.get('http://0.0.0.0:5000')
    session = request.node
    for item in session.items: 
        cls = item.getparent(pytest.Class)
        setattr(cls.obj,'driver',web_driver)
    yield
    web_driver.close()
