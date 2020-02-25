import fs from 'fs';
import _ from 'lodash';
import moment from 'moment';
import RPClient from 'reportportal-client';
import { AgentOptions } from '../models';
import { STATUSES, LOG_LEVELS, TEST_ITEM_TYPES, EVENTS } from '../constants';
import { getScreenshotPossiblePaths, normalizeFileName } from './utils';

export default class PostFactumReporter {

  private client: RPClient;
  private readonly options: AgentOptions;
  private launchId: string;
  private launchStartTime: number | Date;
  private launchParams: any;

  private static getLogWithAttachment(path: string, testStartTime: number | Date, params: any) {
    const fileObj = {
      name: params.fileName,
      type: 'image/png',
      content: fs.readFileSync(path),
    };

    return {
      action: EVENTS.SEND_LOG,
      level: LOG_LEVELS.ERROR,
      time: testStartTime,
      message: params.message || params.fileName,
      fileObj,
    };
  }

  constructor({ agentOptions = { launchParams: {} }, ...clientConfig }) {
    const { launchParams = {}, ...options } = agentOptions;

    this.client = new RPClient(clientConfig);
    this.launchParams = launchParams;
    this.options = options;
    this.launchStartTime = Date.now();
  }

  public startReporting(results: any, done: (param: any) => void): void {
    this.client
      .checkConnect()
      .then(() => this.report(results, done))
      .catch((e: any) => this.finalize(done, { status: STATUSES.FAILED }, e));
  }

  private report(results: any, done: (param: any) => void) {
    const tests = this.collectItems(results);
    const { endTime }: any = _.last(tests);

    this.reportItems(tests);
    this.finalize(done, { endTime });
  }

  private reportItems(items: Array<any>) {
    this.launchId = this.client.startLaunch({
      startTime: this.launchStartTime,
      ...this.launchParams,
    }).tempId;

    const stepsTempIds: Array<string> = [this.launchId];

    items.forEach(({ action, fileObj, ...item } = {}) => {
      switch (action) {
        case EVENTS.START_TEST_ITEM:
          // @ts-ignore
          const stepObj = this.client.startTestItem(item, ...stepsTempIds);
          stepsTempIds.push(stepObj.tempId);
          break;
        case EVENTS.FINISH_TEST_ITEM:
          this.client.finishTestItem(stepsTempIds.pop(), item);
          break;
        case EVENTS.SEND_LOG:
          this.client.sendLog(_.last(stepsTempIds), item, fileObj);
      }
    });
  }

  private getLogWithErrorScreenshot({
    testName,
    suiteName,
    testStartTime,
    message
  }: {
    testName: string,
    suiteName: string,
    testStartTime: number | Date,
    message: string,
  }) {
    const basePath = `${this.options.screenshotsPath}/${suiteName}`;
    const screenshotPaths = getScreenshotPossiblePaths(testName, basePath, testStartTime);
    const pathsCount = screenshotPaths.length;
    const screenshotParams = {
      fileName: `${suiteName}/${normalizeFileName(testName)}`.replace(/[\/\\]/ig, '-'),
      message,
    };

    for (let itemIndex = 0; itemIndex < pathsCount; itemIndex++) {
      const { path, time }: any = screenshotPaths[itemIndex];

      try {
        const logWithAttachment = PostFactumReporter.getLogWithAttachment(path, time, screenshotParams);

        if (logWithAttachment) {
          return logWithAttachment;
        }
      } catch(error) {}
    }

    return null;
  }

  private collectItems(results: any) {
    const items = [];
    const suiteNames = Object.keys(results.modules);

    for (const suiteName of suiteNames) {
      const suite = results.modules[suiteName];
      const suiteStartTime = new Date(this.launchStartTime); // TODO: fix items startTime calculation
      const suiteEndTime = moment(suiteStartTime)
        .add(suite.time, 's')
        .toDate();

      items.push({
        action: EVENTS.START_TEST_ITEM,
        name: suiteName,
        startTime: suiteStartTime,
        type: TEST_ITEM_TYPES.SUITE,
      });

      const tests = { ...suite.completed };
      if (suite.skipped.length) {
        suite.skipped.forEach((itemName: string) => {
          tests[itemName] = {
            name: itemName,
            status: STATUSES.SKIPPED,
          };
        });
      }
      const testNames = Object.keys(tests);
      let testStartTime = suiteStartTime;

      for (const testName of testNames) {
        const test = tests[testName];

        items.push({
          action: EVENTS.START_TEST_ITEM,
          name: testName,
          startTime: testStartTime,
          type: TEST_ITEM_TYPES.STEP,
        });

        testStartTime = moment(testStartTime).add(test.timeMs, 'ms').toDate();

        let status = test.status;

        if (!status) {
          status = test.failed ? STATUSES.FAILED : STATUSES.PASSED;
        }

        if (status === STATUSES.FAILED) {
          if (test.stackTrace) {
            items.push({
              action: EVENTS.SEND_LOG,
              level: LOG_LEVELS.ERROR,
              time: testStartTime,
              message: test.stackTrace,
            });
          }

          const logWithAttachment = this.getLogWithErrorScreenshot({
            testName,
            suiteName,
            testStartTime,
            message: test.stackTrace,
          });

          if (logWithAttachment) {
            items.push(logWithAttachment);
          }
        }

        (test.failed || test.errors) &&
          test.assertions.forEach((assertion: any) => {
            items.push({
              action: EVENTS.SEND_LOG,
              level: LOG_LEVELS.INFO,
              time: testStartTime,
              message: assertion.message,
            });
            assertion.failure &&
              items.push({
                action: EVENTS.SEND_LOG,
                level: LOG_LEVELS.DEBUG,
                time: testStartTime,
                message: assertion.failure,
              });
            assertion.stackTrace &&
              items.push({
                action: EVENTS.SEND_LOG,
                level: LOG_LEVELS.ERROR,
                time: testStartTime,
                message: assertion.stackTrace,
              });
          });

        items.push({
          action: EVENTS.FINISH_TEST_ITEM,
          endTime: testStartTime,
          status,
        });
      }

      items.push({
        action: EVENTS.FINISH_TEST_ITEM,
        endTime: suiteEndTime,
      });
    }

    return items;
  }

  private finalize(done: (param: any) => void, params: any, error?: any) {
    if (this.launchId) {
      this.client.finishLaunch(this.launchId, params);
    }
    done(error);
  }
}
