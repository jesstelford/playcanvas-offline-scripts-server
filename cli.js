#!/usr/bin/env node
'use strict'

const meow = require('meow')
const server = require('./')

const cli = meow(`
  Usage
    $ pc-offline

  Options
    -s, --scripts  Directory containing scripts (default: cwd)
    -p, --port     Port to listen on (default: 51000)

  Examples
    $ pc-offline
    Listening on port 51000

    $ pc-offline --scripts=~/dev/my-game/scripts --port=3000
    Listening on port 3000
  `,
  {
    alias: {
      s: 'scripts',
      p: 'port'
    }
  }
)

server(cli.flags)
