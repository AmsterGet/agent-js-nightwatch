/*
 *  Copyright 2020 EPAM Systems
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import { LOG_LEVELS, EVENTS, STATUSES } from '../../constants';
import { publishIPCEvent as publishEvent } from '../ipc/client';
import { Attribute, LogRQ, Attachment } from '../../models';

type LogMessage = LogRQ['message'];

export interface AttachDataInterface {
  addAttributes(attributes: Array<Attribute>, itemName?: string): void;
  addDescription(text: string, itemName?: string): void;
  setTestCaseId(id: string, itemName?: string): void;
  setStatus(status: STATUSES, itemName?: string): void;

  log(level: LOG_LEVELS, message: LogMessage, file?: Attachment, itemName?: string): void;
  launchLog(level: LOG_LEVELS, message: LogMessage, file?: Attachment): void;

  logInfo(message: LogMessage, file?: Attachment, itemName?: string): void;
  logDebug(message: LogMessage, file?: Attachment, itemName?: string): void;
  logWarn(message: LogMessage, file?: Attachment, itemName?: string): void;
  logError(message: LogMessage, file?: Attachment, itemName?: string): void;
  logTrace(message: LogMessage, file?: Attachment, itemName?: string): void;
  logFatal(message: LogMessage, file?: Attachment, itemName?: string): void;

  launchLogInfo(message: LogMessage, file?: Attachment): void;
  launchLogDebug(message: LogMessage, file?: Attachment): void;
  launchLogWarn(message: LogMessage, file?: Attachment): void;
  launchLogError(message: LogMessage, file?: Attachment): void;
  launchLogTrace(message: LogMessage, file?: Attachment): void;
  launchLogFatal(message: LogMessage, file?: Attachment): void;

  setStatusFailed(itemName?: string): void;
  setStatusPassed(itemName?: string): void;
  setStatusSkipped(itemName?: string): void;
  setStatusStopped(itemName?: string): void;
  setStatusInterrupted(itemName?: string): void;
  setStatusCancelled(itemName?: string): void;
  setStatusInfo(itemName?: string): void;
  setStatusWarn(itemName?: string): void;
}

export const attachData: AttachDataInterface = {
  addAttributes(attributes, itemName) {
    publishEvent(EVENTS.ADD_ATTRIBUTES, { attributes, itemName });
  },
  addDescription(text, itemName) {
    publishEvent(EVENTS.ADD_DESCRIPTION, { text, itemName });
  },
  setTestCaseId(id, itemName) {
    publishEvent(EVENTS.SET_TEST_CASE_ID, { id, itemName });
  },
  setStatus(status, itemName) {
    publishEvent(EVENTS.SET_STATUS, { status, itemName });
  },

  log(level, message, file, itemName) {
    const log: LogRQ = {
      level,
      message,
      file,
    };

    publishEvent(EVENTS.ADD_LOG, { log, itemName });
  },
  launchLog(level, message, file) {
    publishEvent(EVENTS.ADD_LAUNCH_LOG, { level, message, file });
  },

  logInfo(message, file, itemName) {
    const log: LogRQ = {
      level: LOG_LEVELS.INFO,
      message,
      file,
    };

    publishEvent(EVENTS.ADD_LOG, { log, itemName });
  },
  logDebug(message, file, itemName) {
    const log: LogRQ = {
      level: LOG_LEVELS.DEBUG,
      message,
      file,
    };

    publishEvent(EVENTS.ADD_LOG, { log, itemName });
  },
  logWarn(message, file, itemName) {
    const log: LogRQ = {
      level: LOG_LEVELS.WARN,
      message,
      file,
    };

    publishEvent(EVENTS.ADD_LOG, { log, itemName });
  },
  logError(message, file, itemName) {
    const log: LogRQ = {
      level: LOG_LEVELS.ERROR,
      message,
      file,
    };

    publishEvent(EVENTS.ADD_LOG, { log, itemName });
  },
  logTrace(message, file, itemName) {
    const log: LogRQ = {
      level: LOG_LEVELS.TRACE,
      message,
      file,
    };

    publishEvent(EVENTS.ADD_LOG, { log, itemName });
  },
  logFatal(message, file, itemName) {
    const log: LogRQ = {
      level: LOG_LEVELS.FATAL,
      message,
      file,
    };

    publishEvent(EVENTS.ADD_LOG, { log, itemName });
  },

  launchLogInfo(message, file) {
    publishEvent(EVENTS.ADD_LAUNCH_LOG, { level: LOG_LEVELS.INFO, message, file });
  },
  launchLogDebug(message, file) {
    publishEvent(EVENTS.ADD_LAUNCH_LOG, { level: LOG_LEVELS.DEBUG, message, file });
  },
  launchLogWarn(message, file) {
    publishEvent(EVENTS.ADD_LAUNCH_LOG, { level: LOG_LEVELS.WARN, message, file });
  },
  launchLogError(message, file) {
    publishEvent(EVENTS.ADD_LAUNCH_LOG, { level: LOG_LEVELS.ERROR, message, file });
  },
  launchLogTrace(message, file) {
    publishEvent(EVENTS.ADD_LAUNCH_LOG, { level: LOG_LEVELS.TRACE, message, file });
  },
  launchLogFatal(message, file) {
    publishEvent(EVENTS.ADD_LAUNCH_LOG, { level: LOG_LEVELS.FATAL, message, file });
  },

  setStatusFailed(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.FAILED, itemName });
  },
  setStatusPassed(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.PASSED, itemName });
  },
  setStatusSkipped(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.SKIPPED, itemName });
  },
  setStatusStopped(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.STOPPED, itemName });
  },
  setStatusInterrupted(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.INTERRUPTED, itemName });
  },
  setStatusCancelled(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.CANCELLED, itemName });
  },
  setStatusInfo(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.INFO, itemName });
  },
  setStatusWarn(itemName) {
    publishEvent(EVENTS.SET_STATUS, { status: STATUSES.WARN, itemName });
  },
};
