# PlayCanvas Offline Scripts Editor

Use your own editor, offline, to edit PlayCanvas Scripts 2.0 `.js` files. 🎉

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)
[![Travis CI](https://travis-ci.org/jesstelford/playcanvas-offline-scripts-server.svg?branch=master)](https://travis-ci.org/jesstelford/playcanvas-offline-scripts-server)

## Server

This project contains a local server for saving your locally edited files to the
cloud-based PlayCanvas editor.

### Get Started

#### Installation

Requirements:

- [node.js](https://nodejs.org) >=6.5

```shell
npm install -g playcanvas-offline-scripts-server
```

#### Usage

```shell
pc-offline --scripts=~/my-scripts-directory
```

-or-

```shell
cd ~/my-scripts-directory
pc-offline
```

### API

#### `pc-offline` cli

```
  Enable offline script editing with PlayCanvas Scripts 2.0

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
```

#### Node module

```javascript
const pcOffline = require('playcanvas-offline-scripts');

pcOffline({scripts: <dir>, port: <number>});
```

Where;
- `scripts` is the directory containing scripts (default: cwd)
- `port` is an available port to start listening on (default: `51000`)
