//in e2e/tests/homepage.js
const webdriver = require('selenium-webdriver');

const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

describe('create capture', () => {
    // e2e tests are too slow for default Mocha timeout
    this.timeout(10000);

    before(function(done) {
        driver.navigate().to('http://localhost:5000/')
        .then(() => done())
    });

    it('adds capture to page', function(done) {
        let captureButton = driver.findElement(By.css('.startCaptureButton'));
        captureButton.click()
        .then(() => driver.wait(until.elementLocated(By.css('captureDetail'))))
        .then(() => done());
    });

    after(function(done) {
        driver.quit()
        .then(() => done())
    });
});