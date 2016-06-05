# roar [![Build Status](https://secure.travis-ci.org/mklabs/roar.png)](http://travis-ci.org/mklabs/roar)

> CLI utilities / helpers based on meow and minimist

> [wip](https://github.com/mklabs/roar/issues/1)

## Overview

- Parses arguments with either meow or minimist
- Uses `debug` to provide a small logger
- Uses `chalk` and `log-symbols` to extend the logger
- Generates help output
- Helpers for I/O (fs, spawn / exec, glob)
- Error handlers to report with error level
- Command line completion
- Two flavors: ES6 Class or the more functionnal approach

Roar uses either meow or minimist to parse command-line arguments and options,
which needs to be installed alongside roar.

```
# to use minimist
npm install minimist mklabs/roar -S

# to use meow
npm install meow mklabs/roar -S
```

---

```js
// To use minimist
const parser = require('minimist');
const roar = require('roar')(parser);

// To use meow
const parser = require('meow');
const roaw = require('roar')(parser);

const cli = roar();
```

---


```js
const { CLI } = require('roar-cli');

class Command extends CLI {
  get example() {
    return 'cmd <argument> [options]';
  }

  get more() {
    return `
  Examples:

    $ cmd *.js foo/
`;
  }

  // Used to parse arguments with minimist
  get alias() {
    return {
      h: 'help',
      v: 'version',
      d: 'debug',
      f: 'force'
    };
  }

  // Used to generate the help output, along with example / more above
  get flags() {
    return {
      help: 'Show this help output',
      version: 'Show package version',
      debug: 'Enable extended log output',
      force: 'Force file write even if already existing',
      skip: 'Skip scripts hook'
    };
  }
}
```


## roar.CLI

`cli` is an instance of `roar.CLI`. This class exposes various utilities for
parsing options and logging purpose.

```js

const cli = roar(options);

// Similar to
const command = new roar.CLI(options);
```

**Options**

- namespace - Define the debug namespace (eg. require('debug')(namespace)).
- success   - Success message to print with end()
- name      - Command name (default: determined from process.argv)
- argv      - Original array of arguments to parse with minimist (default: process.argv.slice(2))
- env       - Environment variables (default: clone of `process.env`)
- leftpad   - Used to generate help output (default: `'    '`)
- padding   - Used to generate help output (default: `20`)
- stream    - Log output streap (default: process.stderr)

On creation, the following properties will be created:

```js
const cli = new roar.CLI();


cli.argv     // minimist or meow result from "options.argv" or process.argv.slice(2)
cli.alias    // if defined, is used to parse arguments with minimist
cli.flags    // if defined, is used to parse arguments with minimist
cli.example  // if defined, is used to generate help output
cli.more     // if defined, is used to generate help output
cli.debug    // debug module logger, enabled with -d flag
cli.env      // options.env or a clone of process.env
cli.start    // Timestamp marking instance creation, namely used to report
             // build time with `CLI.end()`
```

Some static methods:

- CLI.fail - to invoke with an error, log the error with npmlog error level
- CLI.end  - Log options.success message with elapsed time as a parameter


## Usage

While you can create a CLI instance and interact with it, you can extend
`roar.CLI` and use your own CLI class. This is the recommended way as it allows
greater flexibility and is more suited to complex scenario.

```js
const { CLI } = require('roar-cli');

class Command extends CLI {
  get example() {
    return 'mycp <argument> [options]';
  }

  get more() {
    return `
  Examples:

    $ mycp *.js foo/
`;
  }

  // Used to parse arguments with minimist
  get alias() {
    return {
      h: 'help',
      v: 'version',
      d: 'debug',
      f: 'force'
    };
  }

  // Used to generate the help output, along with example / more above
  get flags() {
    return {
      help: 'Show this help output',
      version: 'Show package version',
      debug: 'Enable extended log output',
      force: 'Force file write even if already existing',
      skip: 'Skip scripts hook'
    };
  }
}

let cmd = new Command({
  namespace: 'cmd'
});

// Enabled with `-d, --debug` flag
cmd.debug('Init cmd %s', cmd.options.name);

// Output generated help and exit with 0
if (cmd.argv.help) {
  cmd.help();
  cmd.exit();
}

// Log helpers
log.success('Operation %s successfull', 'foo');
log.info('Message');
log.warn('Something wrong happened');
log.error('Something wrong happened');
```

## Logger

The logger is based on debug, chalk and log-symbols.

All logs are written to STDERR, unless you provide a different stream.

If you'd like to redirect all logs to a file, you can provide an instance of `fs.WriteStream`:

```js
const fs = require('fs');
let output =

let cli = roar({
  stream: fs.createWriteStream('/tmp/cmd.log')
});
```

The `DEBUG` environment variable is used to enable a specific set of
namespaces, which is used with `this.debug()`, or turned on specifically for
roar instances with `-d, --debug` flag.

