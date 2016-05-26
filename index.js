var CLI = require('./src');

module.exports = roar;
roar.CLI = CLI;

function roar(parser) {
  return function roar(options) {
    return new CLI(parser, options);
  };
}
