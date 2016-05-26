const test = require('gentle-cli');
const { join, resolve } = require('path');

describe('bake init', () => {
  let cli = (cmd = '', binpath = join(__dirname, 'bin/test')) => {
    return test().use(`node ${binpath} ${cmd}`);
  };

  it('bake init', (done) => {
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
