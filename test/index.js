const {Promise} = require('bluebird');
const promising =  require('../lib');
// const {Promise, all, hash, hashSettled, allSettled} = promising; //eslint-disable-line no-unused-vars
const {msg, msgContext, errMsg, logger, Stash} = promising; //eslint-disable-line no-unused-vars
const expect = require('chai').expect;
const stdout = require('test-console').stdout;


// describe('promising-help', function() {
//   it('RSVP Promise is exposed and working', function(done) {
//     new Promise((resolve) => {
//       resolve();
//     })
//       .then(() => done())
//       .catch(err => done(new Error(err)));
//   });
//   it('msg, msgContext, errMsg, logger, and stash are exported', function() {
//     expect(typeof msg).to.equal('function');
//     expect(typeof msgContext).to.equal('function');
//     expect(typeof errMsg).to.equal('function');
//     expect(typeof logger).to.equal('function');
//     expect(typeof stash).to.equal('function');
//   });

//   it('resolved() function continues promise chain', function(done) {
//     let state = [];
//     let chain = () => {
//       state.push('1');
//       return Promise.resolve();
//     };
//     chain()
//       .then(() => {
//         state.push('2');
//         return Promise.resolve();
//       })
//       .then(() => {
//         state.push('3');
//         return Promise.resolve();
//       })
//       .then(() => {
//         expect(state.length).to.equal(3);
//         return Promise.resolve();
//       })
//       .then(done)
//       .catch(err => done(new Error(err)));
//   })

  describe('#msg', () => {
    it('msg is exported', () => {
      expect(typeof msg).to.equal('function');
    });

    it('stdout is as expected when only string prop is included', () => {
      let inspect = stdout.inspect();
      msg('foobar is foo plus bar');
      msg('boobar is nonsense');
      inspect.restore();
      expect(inspect.output[0]).contains('foobar is foo plus bar');
      expect(inspect.output[1]).contains('boobar is nonsense');
    });

    it('stdout is as expected when multiple props are included', () => {
      let inspect = stdout.inspect();
      const options = { foo: true, bar: false };
      msg('boobar is nonsense', options, 1234);
      inspect.restore();
      expect(inspect.output[0]).contains('boobar is nonsense');
      expect(inspect.output[0]).contains('foo:');
      expect(inspect.output[0]).contains('bar:');
      expect(inspect.output[0]).contains('1234');
    });
  });

  describe('#logger', function() {

    it('called directly outputs and proxies value forward', function(done) {
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

    it('called directly outputs and proxies value forward when no value present', function(done) {
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

    it('called with more than one parameter, curries that forward', function(done) {
      new Promise(resolve => {
        resolve('baz');
      })
        .then(value => logger('foo', 'bar', value))
        .then(value => {
          expect(value).to.contain('bar', 'baz');
          expect(value.length).to.equal(2);
        })
        .then(done)
        .catch(err=> done(err));
    });

  }); // logger

  describe('#stash', function() {

    it('no incoming values, stash a static property', (done) => {
      const state = new Stash();
      new Promise(resolve => {
        resolve();
      })
        .then(state.add('foo', 'bar'))
        .then(() => {
          expect(state.stash).has.key('foo');
          expect(state.get('foo')).is.equal('bar');
        })
        .then(done)
        .catch(err => done(err));
    });

    it('incoming hash, stash a static property', (done) => {
      const state = new Stash();
      new Promise(resolve => {
        resolve({baz: 'baz'});
      })
        .then(state.add('foo', 'bar'))
        .then(() => {
          expect(state.stash).has.keys('foo', 'baz');
          expect(state.get('foo')).is.equal('bar');
          expect(state.get('baz')).is.equal('baz');
        })
        .then(done)
        .catch(err => done(err));
    });

    it('incoming hash and junk, locally stash a static property', (done) => {
      const state = new Stash();
      new Promise(resolve => {
        resolve({baz: 'baz'}, 1234, 'abc');
      })
        .then(state.add('foo', 'bar'))
        .then(() => {
          expect(state.stash).has.keys('foo', 'baz');
          expect(state.get('foo')).is.equal('bar');
          expect(state.get('baz')).is.equal('baz');
        })
        .then(done)
        .catch(err => done(err));
    });

    it('incoming hash and junk, locally stash nothing', (done) => {
      const state = new Stash();
      new Promise(resolve => {
        resolve({baz: 'baz'}, 1234, 'abc');
      })
        .then(state.add())
        .then(() => {
          expect(state.stash).has.key('baz');
          expect(state.get('baz')).is.equal('baz');
        })
        .then(done)
        .catch(err => done(err));
    });

    it('incoming hash and junk, locally stash incoming payload as an arranged hash', (done) => {
      const state = new Stash();
      new Promise(resolve => {
        resolve({baz: 'baz'}, 1234, 'abc');
      })
        .then((baz, numberJunk, stringJunk) => state.add({foo: numberJunk, bar: stringJunk}))
        .then(() => {
          expect(state.stash).has.keys('foo', 'bar');
          expect(state.get('foo')).is.equal(1234);
          expect(state.get('bar')).is.equal('abc');
        })
        .then(done)
        .catch(err => done(err));
    });




  //   it('[3 param] should save a non-object value to the property specified', function(done) {
  //     let o = {};
  //     new Promise(resolve => {
  //       resolve('foobar');
  //     })
  //       .then(value => stash(value, o, 'prop'))
  //       .then(() => {
  //         expect(o.prop).to.equal('foobar');
  //         done();
  //       })
  //       .catch(err=> done(new Error(err)));
  //   });

  //   it('[3 param] should save an object value to the property specified', function(done) {
  //     let o = {};
  //     new Promise(resolve => {
  //       resolve({foo: 'bar'});
  //     })
  //       .then(value => stash(value, o, 'prop'))
  //       .then(() => {
  //         expect(o.prop.foo).to.equal('bar');
  //         done();
  //       })
  //       .catch(err=> done(new Error(err)));
  //   });


  //   it('[2 param] an object value passed in -- without a property explictly stated -- will be merged with existing object', function(done) {
  //     let o = {
  //       initially: 'foo'
  //     };
  //     new Promise(resolve => {
  //       resolve({butNow: 'bar'});
  //     })
  //       .then(newObj => stash(newObj, o))
  //       .then(() => {
  //         expect(o.initially).to.equal('foo');
  //         expect(o.butNow).to.equal('bar');
  //         done();
  //       })
  //       .catch(err=> done(new Error(err)));
  //   });
  //   it('[2 param] when the target is an array values are just pushed on the stack', function(done) {
  //     let o = [];
  //     new Promise(resolve => {
  //       resolve('foobar');
  //     })
  //       .then(value => stash(value, o))
  //       .then(() => {
  //         expect(o.length).to.equal(1);
  //         expect(o[0]).to.equal('foobar');
  //         done();
  //       })
  //       .catch(err=> done(new Error(err)));
  //   });

  });

  // let hook;
  // describe('#msg and msgContext', function() {
  //   beforeEach(function() {
  //     hook = captureStream(process.stdout);
  //   });
  //   afterEach(function() {
  //     hook.unhook();
  //   });
  //   it('msg writes to stdout', function() {
  //     let value = true;
  //     expect(value).to.equal(true);
  //   });
  // });


// });
