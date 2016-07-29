'use strict';
/*eslint-disable no-console */
var RSVP = require('rsvp');
var stackTrace = require('stack-trace');
var chalk = require('chalk');
var typeOf = require('type-of');
var _ = require('lodash');

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
function logger() {
  for (var _len = arguments.length, message = Array(_len), _key = 0; _key < _len; _key++) {
    message[_key] = arguments[_key];
  }

  var trace = stackTrace.get();
  var lineNumber = undefined;
  var fileName = undefined;
  var showValue = false;

  var fn = function fn(value) {
    lineNumber = trace[1].getLineNumber();
    fileName = trace[1].getFileName().split('/').pop();
    if (showValue) {
      console.log.apply(console, message.concat([value, chalk.grey(' [' + fileName + ': ' + lineNumber + ']')]));
    } else {
      console.log.apply(console, message.concat([chalk.grey(' [' + fileName + ': ' + lineNumber + ']')]));
    }

    return value;
  };

  if (message.length > 1) {
    // Explicit signature call
    lineNumber = trace[1].getLineNumber();
    fileName = trace[1].getFileName().split('/').pop();
    console.log(message, chalk.grey(' [' + fileName + ': ' + lineNumber + ']'));
    return resolved(message.pop());
  }

  return fn;
}
exports.logger = logger;
logger.prototype.show = function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return function () {
    var fn = logger;
    fn.showValue = true;
    return fn(args);
  };
};
exports.logger.show = logger.show;

var _msgContext = '';
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
    this._msgContext = '[[' + _.keys(context).map(function (key, index) {
      return index + ':' + key + ';';
    }).join(' ') + ']]';
  } else {
    this._msgContext = '';
  }
}

/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
function msg() {
  var trace = stackTrace.get();
  var lineNumber = trace[1].getLineNumber();
  var fileName = trace[1].getFileName().split('/').pop();

  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  console.log.apply(console, [this._msgContext].concat(args, [chalk.grey(' [' + fileName + ': ' + lineNumber + ']')]));
  return RSVP.resolve();
}
exports.msg = msg;

/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
function errMsg() {
  var trace = stackTrace.get();
  var lineNumber = trace[1].getLineNumber();
  var fileName = trace[1].getFileName().split('/').pop();
  var traceItems = [];
  for (var i = 1; i < traceItems.length; i++) {
    traceItems.pushObject(traceItems[i].getFileName() + ' => line ' + traceItems[i].getLineNumber());
  }

  for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  console.log.apply(console, args.concat([chalk.grey(' [' + fileName + ': ' + lineNumber + ']\n\n' + traceItems.join('\n'))]));
  return RSVP.resolve();
}
exports.errMsg = errMsg;

function stash() {
  var value = undefined;
  var target = undefined;
  var property = undefined;

  for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }

  switch (args.length) {
    case 3:
      value = args[0];
      target = args[1];
      property = args[2];

      target[property] = value;
      return RSVP.resolve(value);
    case 2:
      value = args[0];
      target = args[1];

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
exports.stash = stash;