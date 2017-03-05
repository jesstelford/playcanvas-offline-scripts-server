const upath = require('upath')
const chokidar = require('chokidar')

const serverFactory = require('./server-factory')
const sparky = require('./sparky')

const PORT = 51000

module.exports = function server ({scripts, port = PORT} = {}) {
  // Accept both relative & absolute paths, defaulting to `process.cwd()`
  const directory = upath.resolve(scripts || '')

  const watcher = chokidar.watch(`${directory}/**/*.{js,json}`, {
    cwd: directory,
    ignored: /(^|[/\\])\../, // Ignore dot files
    persistent: true // keep alive
  })

  const stopServer = serverFactory({
    directory,
    port,
    socketConnector: sparky({watcher, directory})
  })

  return {
    scripts: directory,
    port,
    stop: () => {
      watcher.close()
      stopServer()
    }
  }
}
