'use strict';
var path = require('path');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var lint = require('gulp-tslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');
var player = require('play-sound')();
var merge = require('merge2');
var debug = require('debug')('gulp');
var watching = false;
var coverage = false;
var mochaErr = [];

var tsProject = ts.createProject('tsconfig.json');
// var tsTesting = ts.createProject('test/tsconfig.json');

function warn(message) {
  console.log(message);
  player.play('WarningSound.mp3', function(err) {
    if (err) {
      debug('problem playing warning sound');
    }
  });
}

function errorSound() {
  player.play('ErrorSound.mp3', function(err) {
    if (err) throw err;
  });
}

gulp.task('static', function () {
  return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
    .pipe(lint())
    .pipe(lint.report({
      emitError: true
    }))
    .on('error', function(...args) {
      warn(`there were linting errors: ${args}`);
    });
});

gulp.task('nsp', function (cb) {
  nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('transpile-source', function() {
  return gulp.src('src/**/*.ts')
    .pipe(ts({
      target: "es5",
      "declaration": true,
      "module": "commonjs",
      "target": "es5",
      "moduleResolution": "node",
      "outDir": "./lib",
      "preserveConstEnums": true,
      "sourceMap": true,
      "removeComments": true
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('transpile-tests', function() {
  return gulp.src('test/**/*.ts')
    .pipe(ts({
      "sourceMap": true,
      "target": "es5",
      "declaration": true,
      "module": "commonjs",
      "target": "es5",
      "preserveConstEnums": true,
      "moduleResolution": "node"
    }))
    .pipe(gulp.dest('test'));
});

gulp.task('transpile', ['transpile-source', 'transpile-tests']);

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function (err) {
      errorSound();
      if (watching) {
        mochaErr.push('Mocha error: ' + err);
        this.emit('end');
      }
    })
    // .pipe(istanbul.writeReports())
    .on('end', function () {
      if(mochaErr.length > 0) {
        console.log('ERROR: ', mochaErr.join('\n\n'));
        mochaErr = [];
        cb();
      }
    });
});

gulp.task('watch', ['transpile', 'static'], function () {
  watching = true;
  gulp.watch(['src/**/*.ts', 'test/**/*-test.ts'], ['transpile', 'static', 'test']);
});

gulp.task('prepublish', ['nsp']);
gulp.task('default', ['static', 'test']);
