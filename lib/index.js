'use strict';
/*eslint-disable no-console */
const RSVP = require('rsvp');
const stackTrace = require('stack-trace');
const chalk = require('chalk');
const typeOf = require('type-of');
const _ = require('lodash');

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
  let showValue = false;

  let fn = value => {
    lineNumber = trace[1].getLineNumber();
    fileName = trace[1].getFileName().split('/').pop();
    if (showValue) {
      console.log(...message, value, chalk.grey(` [${fileName}: ${lineNumber}]`));
    } else {
      console.log(...message, chalk.grey(` [${fileName}: ${lineNumber}]`));
    }

    return value;
  };

  if (message.length > 1) {
    // Explicit signature call
    lineNumber = trace[1].getLineNumber();
    fileName = trace[1].getFileName().split('/').pop();
    console.log(message, chalk.grey(` [${fileName}: ${lineNumber}]`));
    return RSVP.resolve(message.pop());
  }

  return fn;
}

let _msgContext = '';
/**
 * Sets a context which will be prefixed to the logging as a string
 * name/value pairings (comma delimited); this allows for transactions
 * to be more easily kept together.
 *
 * @param  {object} context [description]
 * @return {[type]}         [description]
 */
function msgContext(context) {
  if (context) {
    _msgContext = '[[' + _.keys(context).map((key, index) => {
      return `${index}:${key};`;
    }).join(' ') + ']]';
  } else {
    _msgContext = '';
  }
}

/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
function msg(...args) {
  const trace = stackTrace.get();
  const lineNumber = trace[1].getLineNumber();
  const fileName = trace[1].getFileName().split('/').pop();

  console.log(_msgContext, ...args, chalk.grey(` [${fileName}: ${lineNumber}]`));
  return RSVP.resolve();
}

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
      console.log('pushing value: ', value);
      target.push(value);
    } else {
      throw new Error('invalid use of stash parameters:' + JSON.stringify(args, null, 2));
    }
    return RSVP.resolve(value);
  }


}

module.exports = {
  msg,
  msgContext,
  errMsg,
  logger,
  stash,
  Promise: RSVP.Promise,
  RSVP
};
