#!/usr/bin/env node

const assert   = require('assert');
const meow     = require('meow');
const minimist = require('minimist');
const roar     = require('..');
const test     = require('gentle-cli');

const { join, resolve } = require('path');

describe('Basic assertions', () => {

  let namespace = 'foo:cli';
  let success = '... Done in %sms ...';

  describe('meow', () => {
    it('is an instance of roar.CLI / EventEmitter', () => {
      const cli = roar(meow)();
      assert.ok(cli instanceof roar.CLI);
      assert.ok(cli instanceof require('events').EventEmitter);
    });

    it('creates default options', () => {
      const cli = roar(meow)();
      assert.deepEqual(cli.options, {
        namespace: 'cli',
        success: 'Done in %sms',
        name: '_mocha'
      });
    });

    it('creates options', () => {
      const options = { namespace, success };
      const cli = roar(meow)(options);
      assert.deepEqual(cli.options, options);
    });
  });

  describe('minimist', () => {
    it('is an instance of roar.CLI / EventEmitter', () => {
      const cli = roar(minimist)();
      assert.ok(cli instanceof roar.CLI);
      assert.ok(cli instanceof require('events').EventEmitter);
    });

    it('creates default options', () => {
      const cli = roar(minimist)();
      assert.deepEqual(cli.options, {
        namespace: 'cli',
        success: 'Done in %sms',
        name: '_mocha'
      });
    });

    it('creates options', () => {
      const options = { namespace, success };
      const cli = roar(minimist)(options);
      assert.deepEqual(cli.options, options);
    });
  });

  describe('node test/bin/test -d', () => {
    let cli = (cmd = '', binpath = join(__dirname, 'bin/test')) => {
      return test().use(`node ${binpath} ${cmd}`);
    };

    it('Outputs log to stream', (done) => {
      cli('-d')
        .expect('log info OK')
        .expect('log warn OK')
        .expect('log error OK')
        .expect('log success OK')
        .expect(/Done in \d+ms/)
        .expect(2)
        .end(done);
    });
  });
});
