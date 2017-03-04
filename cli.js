#!/usr/bin/env node
'use strict';

const meow = require('meow');
const server = require('./');

const cli = meow(`
    Usage
      $ pc-offline

    Options
      -s, --scripts  Directory containing scripts (default: cwd)

    Examples
      $ pc-offline
      Listening on port 51000

      $ pc-offline --scripts=~/dev/my-game/scripts
      Listening on port 51000
`, {
    alias: {
        s: 'scripts'
    }
});

server(cli.flags);
