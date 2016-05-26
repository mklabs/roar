## hcp (1) - handlebars-copy

> Like cp, but with Handlebars template

    npm install hcp

## Usage

hcp is a CLI tool similar to the `cp` command.

File copy is done using Streams, with Handlebars parsing files if they have
template placeholder `{{ ... }}`.

Handlebars template are executed in the context of the following object:

```js
Object.assign({}, env, config, opts)
```

wher `env`, `config` and `opts` have the following structure:

```js
{
  env: {
    PATH: '...',
    ...
  },

  config: {
    name: 'Default name'
  }

  opts: {
    debug: true,
    name: 'Foobar'
  },

}
```

The templates context is a merged version of all possible data, with the
following order of precedence:

- opts    - Command line flags as parsed by minimist
- config  - Additionnal data coming from package.json "hcp" field
- env     - Copy of `process.env`

## Prompts

Handlebars templates can have any number of placeholders. Variables are either
available in the context object, or automatically prompted for the user to
enter a value.

Skipping a prompt is then available with `--name Value`.
