'use strict';
/*eslint-disable no-console */
var RSVP = require('rsvp');
var stackTrace = require('stack-trace');
var chalk = require('chalk');
var typeOf = require('type-of');

// EXPOSE RSVP
exports.Promise = RSVP.Promise;
exports.all = RSVP.all;
exports.allSettled = RSVP.allSettled;
exports.hash = RSVP.hash;
exports.hashSettled = RSVP.hashSettled;
exports.defer = RSVP.defer;

function resolved(value) {
  return new RSVP.Promise(function (resolve) {
    return resolve(value);
  });
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
  return function (value) {
    var trace = stackTrace.get();
    var lineNumber = trace[1].getLineNumber();
    var fileName = trace[1].getFileName().split('/').pop();
    if (typeOf(message) === 'string') {
      message = [message];
    }

    console.log(message, chalk.grey(' [' + fileName + ': ' + lineNumber + ']'));
    return value;
  };
}
exports.logger = logger;

/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
function msg() {
  var trace = stackTrace.get();
  var lineNumber = trace[1].getLineNumber();
  var fileName = trace[1].getFileName().split('/').pop();

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  console.log.apply(console, args.concat([chalk.grey(' [' + fileName + ': ' + lineNumber + ']')]));
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

  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  console.log.apply(console, args.concat([chalk.grey(' [' + fileName + ': ' + lineNumber + ']\n\n' + traceItems.join('\n'))]));
  return RSVP.resolve();
}
exports.errMsg = errMsg;

function stash(saveValue, object, property) {
  object[property] = saveValue;
  return RSVP.resolve(saveValue);
}
exports.stash = stash;