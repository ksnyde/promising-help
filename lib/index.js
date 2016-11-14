"use strict";
var Promise = require('bluebird');
var stackTrace = require('stack-trace');
var chalk = require('chalk');
var _ = require('lodash');
var context = {};
function setContext(c) {
    context = _.assign(context, c);
}
exports.setContext = setContext;
function clearContext() {
    context = {};
}
exports.clearContext = clearContext;
function contextString(c) {
    if (c) {
        var props_1 = [];
        Object.keys(context).map(function (key) {
            props_1.push(key + ": " + chalk.grey(context[key]));
        });
        return '[ ' + props_1.join('; ') + ' ]';
    }
    return '';
}
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
    console.log(contextString(context), first, chalk.grey(" [" + fileName + ": " + lineNumber + "]"));
    if (rest.length > 0) {
        console.log(chalk.grey('Parameters proxied through the promise chain:'));
        rest.map(function (lineItem, index) {
            console.log(("  " + index + ": ") + chalk.grey(lineItem));
        });
        console.log(chalk.grey('---'));
    }
    return Promise.resolve(rest);
}
exports.logger = logger;
function msg(first) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    var trace = stackTrace.get();
    var lineNumber = trace[1].getLineNumber();
    var fileName = trace[1].getFileName().split('/').pop();
    console.log.apply(console, [contextString(context), first].concat(rest, [chalk.grey(" [" + fileName + ": " + lineNumber + "]")]));
    return Promise.resolve();
}
exports.msg = msg;
var Stash = (function () {
    function Stash(init) {
        this._stash = {};
        if (init) {
            this._stash = init;
        }
    }
    Object.defineProperty(Stash.prototype, "stash", {
        get: function () {
            return this._stash;
        },
        enumerable: true,
        configurable: true
    });
    Stash.prototype.get = function (property) {
        return this._stash[property];
    };
    Stash.prototype.toString = function () {
        return JSON.stringify(this._stash);
    };
    Stash.prototype.add = function (property, value) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (property) {
                if (typeof property === 'string') {
                    _this._stash[property] = value;
                }
                if (typeof property === 'object' && !value) {
                    console.log("property " + property + " is a hash");
                    _this._stash = _.assign(property, _this._stash);
                }
            }
            args.map(function (argument) {
                if (typeof argument === 'object') {
                    _this._stash = _.assign(argument, _this._stash);
                }
            });
            return Promise.resolve(args);
        };
    };
    return Stash;
}());
exports.Stash = Stash;
