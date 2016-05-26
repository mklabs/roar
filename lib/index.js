const path       = require('path');
const events     = require('events');
const debug      = require('debug');
const log        = require('./log');
const fsutil     = require('./util');
const { spawn }  = require('child_process');

const PADDING = 20;

export default class CLI extends events.EventEmitter {

  get example() { return ''; }

  get alias() {
    return {
      h: 'help',
      v: 'version',
      d: 'debug'
    };
  }

  get flags() {
    return {
      help: 'Show this help output',
      version: 'Show package version'
    };
  }

  constructor(parser, opts = {}) {
    super();

    if (!parser) throw new Error('Must provide a parser');
    this.parser = parser;
    this.start = Date.now();

    this.options = opts;
    this.options.namespace = this.options.namespace || 'cli';
    this.options.success = this.options.success || ('Done in %sms');

    this.options.name = this.options.name || path.basename(process.argv[1]);
    this.stream = this.options.stream || process.stderr;

    this.argv = this.parse(this.options.argv);

    this.args = this.argv._.concat();
    this.env = this.options.env || Object.assign({}, process.env);

    if (this.options.debug || this.argv.debug) {
      debug.enable(this.options.namespace);
    }

    this.debug = debug(this.options.namespace);
  }

  parse(argv = process.argv.slice(2), alias = this.alias) {
    let opts = this.parser(argv, { alias });

    // already minimist
    if (opts._) return opts;

    // meow parser
    if (opts.input && opts.flags) {
      this.meow = opts;
      return Object.assign({ _: opts.input }, opts.flags);
    }

    return opts;
  }

  exec(recipe, opts = { env: this.env, stdio: 'inherit' }) {
    return new Promise((r, errback) => {
      this.debug('exec:', recipe);
      this.silly('env:', opts.env);
      spawn('bash', ['-c', recipe], opts)
        .on('error', errback)
        .on('close', (code) => {
          if (code !== 0) {
            this.error(recipe);
            return errback(new Error('Recipe exited with code %d', code));
          }

          r();
        });
    });
  }

  end(code = 0) {
    var time = Date.now() - this.start;
    this.info(this.options.success, time);
    process.exit(code);
  }

  help(targets = {}) {
    let targetList = '';
    let leftpad = this.options.leftpad || '    ';
    if (Object.keys(targets).length) targetList += ' Targets:\n';

    var keys = Object.keys(targets);
    targetList += keys.map((t) => {
      return leftpad + t + this.pad(t) + 'Run target ' + t;
    }).join('\n');

    var options = '';
    if (this.flags) {
      options += 'Options:\n';
      options += Object.keys(this.flags).map((flag) => {
        return leftpad + '--' + flag + this.pad('--' + flag) + this.flags[flag];
      }).join('\n');
    }

    let opts = {
      example: this.example || this.options.example,
      name: this.options.name,
      commands: targetList,
      more: this.more,
      options,
    };

    return CLI.help(opts);
  }

  pad(str, padding = (this.options.padding || PADDING)) {
    let len = padding - str.length;
    return new Array(len <= 1 ? 2 : len).join(' ');
  }

  // Help output
  //
  // Options:
  //
  // - name     - Used in the generated example (ex: $ name --help)
  // - example  - Used in the generated example instead of the default one
  // - options  - Used in the generated example instead of the default one
  static help(options = {}) {
    options.name = options.name || '';
    options.example = options.example || (options.name + ' --help');

    console.log(`
  $ ${options.example}

  ${options.options}`);

    if (options.commands) console.log('\n', options.commands);
    if (options.more) console.log(options.more);

    console.log();
  }

  static fail(e, exit) {
    log.error.apply(log, arguments);
    if (exit) process.exit(isNaN(exit) ? 1 : exit);
  }

  static end(message, time, cb) {
    log.info(message, time);
    cb && cb();
  }


}

CLI.PADDING = PADDING;

Object.assign(CLI.prototype, log);
Object.assign(CLI.prototype, fsutil);
