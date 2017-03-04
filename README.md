# PlayCanvas Offline Scripts Editor

Use your own editor, offline, to edit PlayCanvas Scripts 2.0 `.js` files. 🎉

## Server

This project contains a local server for saving your locally edited files to the
cloud-based PlayCanvas editor.

### Get Started

#### Installation

Requirements:

- [node.js](https://nodejs.org) >=6.5

```
npm install -g playcanvas-offline-scripts-server
```

#### Usage

```
pc-offline --scripts=~/my-scripts-directory/
```

-or-

```
cd ~/my-scripts-directory/
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

  Examples
    $ pc-offline
    Listening on port 51000

    $ pc-offline --scripts=~/dev/my-game/scripts
    Listening on port 51000
```

#### Node module

```
const pcOffline = require('playcanvas-offline-scripts');

pcOffline({scripts: <dir>});
```

Where `scripts` is the directory containing scripts (default: cwd)
