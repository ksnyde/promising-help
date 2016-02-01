import assert from 'assert';
import promising from '../lib';
const {Promise, all, hash, hashSettled, allSettled} = promising; //eslint-disable-line no-unused-vars
const {resolved, defer} = promising; //eslint-disable-line no-unused-vars
const {msg, errMsg, logger, stash} = promising; //eslint-disable-line no-unused-vars
const chai = require('chai');
const expect = require('chai').expect;
chai.should();

describe('promising-help', function() {
  it('RSVP Promise is exposed', function(done) {
    new Promise((resolve) => {
      resolve();
    })
      .then(() => done())
      .catch(err => done(new Error(err)));
  });

  it('resolved() function continues promise chain', function(done) {
    let state = [];
    new Promise(resolve => {
      state.push('1');
      resolve();
    })
      .then(() => {
        state.push('2');
        return resolved();
      })
      .then(() => {
        state.push('3');
        return resolved();
      })
      .then(() => {
        expect(state.length).to.equal(3);
        return resolved();
      })
      .then(done)
      .catch(err => done(new Error(err)));
  })

  describe('#logger', function() {

    it('"logger" called directly outputs and proxies value forward', function(done) {
      new Promise(resolve => {
        resolve('foobar');
      })
        .then(logger('foo'))
        .then(value => {
          expect(value).to.equal('foobar');
        })
        .then(done)
        .catch(err=> done(new Error(err)));
    });

    it('"logger" called directly outputs and proxies value forward when no value present', function(done) {
      let state = 1;
      new Promise(resolve => {
        state = 2;
        resolve();
      })
        .then(logger('foo'))
        .then(value => {
          expect(value).to.not.be.ok;
          expect(state).to.equal(2);
        })
        .then(done)
        .catch(err=> done(new Error(err)));
    });

    it('"logger" in an explicit casting where value exists', function(done) {
      new Promise(resolve => {
        resolve('baz');
      })
        .then(value => logger('foo', 'bar', value))
        .then(value => {
          expect(value).to.equal('baz');
        })
        .then(done)
        .catch(err=> done(new Error(err)));
    });

  }); // logger

  describe('#stash', function() {

    it('[3 param] should save a non-object value to the property specified', function(done) {
      let o = {};
      new Promise(resolve => {
        resolve('foobar');
      })
        .then(value => stash(value, o, 'prop'))
        .then(() => {
          expect(o.prop).to.equal('foobar');
          done();
        })
        .catch(err=> done(new Error(err)));
    });

    it('[3 param] should save an object value to the property specified', function(done) {
      let o = {};
      new Promise(resolve => {
        resolve({foo: 'bar'});
      })
        .then(value => stash(value, o, 'prop'))
        .then(() => {
          expect(o.prop.foo).to.equal('bar');
          done();
        })
        .catch(err=> done(new Error(err)));
    });


    it('[2 param] an object value passed in -- without a property explictly stated -- will be merged with existing object', function(done) {
      let o = {
        initially: 'foo'
      };
      new Promise(resolve => {
        resolve({butNow: 'bar'});
      })
        .then(newObj => stash(newObj, o))
        .then(() => {
          expect(o.initially).to.equal('foo');
          expect(o.butNow).to.equal('bar');
          done();
        })
        .catch(err=> done(new Error(err)));
    });
    it('[2 param] when the target is an array values are just pushed on the stack', function(done) {
      let o = [];
      new Promise(resolve => {
        resolve('foobar');
      })
        .then(value => stash(value, o))
        .then(() => {
          expect(o.length).to.equal(1);
          expect(o[0]).to.equal('foobar');
          done();
        })
        .catch(err=> done(new Error(err)));
    });

  });

});
