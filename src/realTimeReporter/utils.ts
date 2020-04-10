import { EVENTS, DEFAULT_FILE_TYPE } from '../constants';
import { getSystemAttributes, buildCodeRef } from '../utils';
import { Attachment, StartLaunchRQ, Attribute } from '../models';

export const publishEvent = (event: EVENTS, msg: any): void => {
  // @ts-ignore
  process.emit(event, msg);
};

export const subscribeToEvent = (event: EVENTS, callback: (params: any) => void): void => {
  // @ts-ignore
  process.on(event, callback);
};

export const setDefaultFileType = (file: Attachment): Attachment =>
    file ? { type: DEFAULT_FILE_TYPE, ...file } : undefined;

export const getStartLaunchObj = (launchObj: StartLaunchRQ): StartLaunchRQ => {
  const systemAttributes: Array<Attribute> = getSystemAttributes();

  return {
    ...launchObj,
    attributes: launchObj.attributes ? launchObj.attributes.concat(systemAttributes) : systemAttributes,
  }
};

export const getCodeRef = (itemName: string): string => {
  const caller = getCaller();
  const testPath = caller.getFileName();

  return buildCodeRef(testPath, itemName);
};

const getCaller = (): NodeJS.CallSite => {
  const stack = getStack();

  // Remove superfluous function calls on stack
  stack.shift(); // getCaller --> getStack
  stack.shift(); // your function call --> getCaller

  // Return caller's caller
  return stack[1];
};

const getStack = (): Array<NodeJS.CallSite> => {
  // Save original Error.prepareStackTrace
  const origPrepareStackTrace = Error.prepareStackTrace;

  // Override with function that just returns `stack`
  Error.prepareStackTrace = function (_, stack) {
    return stack;
  };

  // Create a new `Error`, which automatically gets `stack`
  const err = new Error();

  // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
  const stack = err.stack;

  // Restore original `Error.prepareStackTrace`
  Error.prepareStackTrace = origPrepareStackTrace;

  // Remove superfluous function call on stack
  //@ts-ignore
  stack.shift(); // getStack --> Error

  //@ts-ignore
  return stack;
};
