'use strict';
/*eslint-disable no-console */
const RSVP = require('rsvp');
const stackTrace = require('stack-trace');
const chalk = require('chalk');
const typeOf = require('type-of');

// EXPOSE RSVP
exports.Promise = RSVP.Promise;
exports.all = RSVP.all;
exports.allSettled = RSVP.allSettled;
exports.hash = RSVP.hash;
exports.hashSettled = RSVP.hashSettled;
exports.defer = RSVP.defer;

function resolved(value) {
  return RSVP.resolve(value);
}
exports.resolved = resolved;

/**
 * Allow logging to stdout in your promise pipeline while allowing for
 * the prior step's output to be proxied through to the next stage
 * @param  {string}   message either a string or an array of values which will be pushed to stdout
 * @param  {variant}  proxy   pass input to output
 * @return {Function}
 */
function logger(...message) {
  const trace = stackTrace.get();
  let lineNumber;
  let fileName;

  if (message.length > 1) {
    // Explicit call
    lineNumber = trace[1].getLineNumber();
    fileName = trace[1].getFileName().split('/').pop();
    console.log(message, chalk.grey(` [${fileName}: ${lineNumber}]`));
    return resolved(message.pop());
  }

  return function(value = null) {
    lineNumber = trace[0].getLineNumber();
    fileName = trace[0].getFileName().split('/').pop();
    console.log(message, chalk.grey(` [${fileName}: ${lineNumber}]`));
    return value;
  };
}
exports.logger = logger;

/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
function msg(...args) {
  const trace = stackTrace.get();
  const lineNumber = trace[1].getLineNumber();
  const fileName = trace[1].getFileName().split('/').pop();

  console.log(...args, chalk.grey(` [${fileName}: ${lineNumber}]`));
  return RSVP.resolve();
}
exports.msg = msg;

/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
function errMsg(...args) {
  const trace = stackTrace.get();
  const lineNumber = trace[1].getLineNumber();
  const fileName = trace[1].getFileName().split('/').pop();
  const traceItems = [];
  for (let i = 1; i < traceItems.length; i++) {
    traceItems.pushObject(`${traceItems[i].getFileName()} => line ${traceItems[i].getLineNumber()}`);
  }

  console.log(...args, chalk.grey(` [${fileName}: ${lineNumber}]\n\n${traceItems.join('\n')}`));
  return RSVP.resolve();
}
exports.errMsg = errMsg;

function stash(...args) {
  let value;
  let target;
  let property;

  switch (args.length) {
  case 3:
    [value, target, property] = args;
    target[property] = value;
    return RSVP.resolve(value);
  case 2:
    [value, target] = args;
    if (typeOf(value) === 'object' && typeOf(target) === 'object') {
      target = Object.assign(target, value);
    } else if (typeOf(target) === 'array') {
      target.push(value);
    } else {
      throw new Error('invalid use of stash parameters:' + JSON.stringify(args, null, 2));
    }
    return RSVP.resolve(value);
  }


}
exports.stash = stash;
