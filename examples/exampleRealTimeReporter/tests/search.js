const fs = require('fs');
const path = require('path');
const { PublicReportingAPI, FILE_TYPES } = require('../../../build');

const suiteName = 'Search';

module.exports = {
  before: function (browser, done) {
    const item = {
      name: suiteName,
      description: 'Suite description',
      attributes: [{ key: 'suite', value: 'search' }],
    };

    PublicReportingAPI.startSuite(item);
    done();
  },

  beforeEach: function (browser, done) {
    PublicReportingAPI.startTestCase(browser.currentTest, suiteName);
    done();
  },

  afterEach: function (browser, done) {
    PublicReportingAPI.finishTestCase(browser.currentTest);

    PublicReportingAPI.startAfterTestCase();
    // afterEach related actions
    PublicReportingAPI.finishAfterTestCase();

    done();
  },

  after: function (browser, done) {
    PublicReportingAPI.finishSuite(suiteName);
    browser.end();
    done();
  },

  'demo test google' : function (client) {
    client
      .url('https://google.com')
      .waitForElementPresent('foo', 1000);

    PublicReportingAPI.logInfo('Info log for demo test item');
    PublicReportingAPI.launchLogDebug('Debug log for launch');
    PublicReportingAPI.setDescription('Demo test for google.com');
  },

  'part two' : function(client) {
    client
      .setValue('input[type=text]', ['nightwatch', client.Keys.ENTER])
      .pause(1000)
      .assert.urlContains('search?')
      .assert.urlContains('nightwatch')
      .end();

    const attachment = {
      name: 'Cities',
      type: FILE_TYPES.JSON,
      content: fs.readFileSync(path.resolve(__dirname, '../data', 'cities.json')),
    };

    PublicReportingAPI.launchLogInfo('Log with attachment for launch', attachment);
  }
};