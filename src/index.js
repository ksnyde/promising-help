"use strict";
var Promise = require('bluebird');
var stackTrace = require('stack-trace');
var chalk = require('chalk');
var type_of_1 = require('type-of');
var _ = require('lodash');
/**
 * Allow logging to stdout in your promise pipeline while allowing for
 * the prior step's output to be proxied through to the next stage
 * @param  {string}   first   a value
 * @param  {string}   rest    an array of values sent to stdout
 * @return {Function}
 */
function logger(first) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    var trace = stackTrace.get(null);
    var lineNumber;
    var fileName;
    lineNumber = trace[1].getLineNumber();
    fileName = trace[1].getFileName().split('/').pop();
    console.log(first, chalk.grey(" [" + fileName + ": " + lineNumber + "]"));
    if (rest.length > 0) {
        console.log('Parameters in the promise chain right now are:');
        rest.map(function (lineItem, index) {
            console.log(("  - " + index + ": ") + chalk.grey(lineItem));
        });
        console.log('---');
    }
    return Promise.resolve(rest);
}
exports.logger = logger;
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
        _msgContext = '[[' + _.keys(context).map(function (key, index) {
            return index + ":" + key + ";";
        }).join(' ') + ']]';
    }
    else {
        _msgContext = '';
    }
}
exports.msgContext = msgContext;
/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
function msg() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var trace = stackTrace.get();
    var lineNumber = trace[1].getLineNumber();
    var fileName = trace[1].getFileName().split('/').pop();
    console.log.apply(console, [_msgContext].concat(args, [chalk.grey(" [" + fileName + ": " + lineNumber + "]")]));
    return Promise.resolve();
}
exports.msg = msg;
function stash() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var value;
    var target;
    var property;
    switch (args.length) {
        case 3:
            value = args[0], target = args[1], property = args[2];
            target[property] = value;
            return Promise.resolve(value);
        case 2:
            value = args[0], target = args[1];
            if (type_of_1["default"](value) === 'object' && type_of_1["default"](target) === 'object') {
                target = Object.assign(target, value);
            }
            else if (type_of_1["default"](target) === 'array') {
                console.log('pushing value: ', value);
                target.push(value);
            }
            else {
                throw new Error('invalid use of stash parameters:' + JSON.stringify(args, null, 2));
            }
            return Promise.resolve(value);
    }
}
exports.stash = stash;
