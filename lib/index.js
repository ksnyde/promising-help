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
exports.resolve = RSVP.resolve;
exports.defer = RSVP.defer;

function resolved(value) {
  return new RSVP.Promise(resolve => resolve(value));
}
exports.resolved = resolved;

/**
 * Allow logging to stdout in your promise pipeline while allowing for
 * the prior step's output to be proxied through to the next stage
 * @param  {string}   message either a string or an array of values which will be pushed to stdout
 * @param  {variant}  proxy   pass input to output
 * @return {Function}
 */
function logger(message) {
  return function(value) {
    const trace = stackTrace.get();
    const lineNumber = trace[1].getLineNumber();
    const fileName = trace[1].getFileName().split('/').pop();
    if (typeOf(message) === 'string') {
      message = [message];
    }

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
  return resolved();
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
  return resolved();
}
exports.errMsg = errMsg;

function stash(saveValue, object, property) {
  object[property] = saveValue;
  return resolved(saveValue);
}
exports.stash = stash;
