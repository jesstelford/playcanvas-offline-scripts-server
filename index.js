const fs = require('fs')
const path = require('path')
const http = require('http')
const Primus = require('primus')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const httpShutdown = require('http-shutdown')

const primusConfig = require('./primus-config')

const PORT = 51000

function getFileHash (filePath) {
  return 'TODO: md5hash'
}

function outputConflict (filename, localContents, remoteContents) {
  // TODO: Use a diff algorithm to find what's changed, then console.error
  // it out with a message about refusing to merge
  console.log(`Conflict in ${filename}:\nLocal contents:\n\n${localContents}\n\nRemote Contents:\n\n${remoteContents}`)
}

function handleConflict (filename, remoteContents) {
  // TODO: Check file exists first. If not, just write it out (conflict
  // resolved!)
  fs.readFileSync(filename, (error, localContents) => {
    if (error) {
      // TODO: Better error message
      console.error(error)
      return
    }
    outputConflict(filename, localContents, remoteContents)
  })
}

function watch (path, callback) {
  callback()
}

module.exports = function server ({scripts, port = PORT} = {}) {
  // Accept both relative & absolute paths, defaulting to `process.cwd()`
  const directory = path.resolve(scripts || '')

  const staticFileHandler = serveStatic(directory, {index: false})

  // Our HTTP server (with graceful shutdown added)
  const httpServer = httpShutdown(http.createServer((req, res) => {
    staticFileHandler(req, res, finalhandler(req, res))
  }))

  // Our socket server wraps the HTTP server
  // Also exposes a `/primus/primus.js` client bundle:
  //   https://github.com/primus/primus#client-library
  // The bundle can then be used in the Chrome Extension:
  //   https://developer.chrome.com/extensions/contentSecurityPolicy#relaxing-remote-script
  const socketServer = new Primus(httpServer, primusConfig)

  socketServer.on('connection', (spark) => {
    // Immediately trigger a sync
    spark.emit('sync', {
      'doit.js': getFileHash('doit.js')
    })

    spark.on('conflict', ({filename, contents}) => {
      handleConflict(filename, contents)
    })

    spark.on('sync', (files) => {
      for (let file in files) {
        if (!files.hasOwnProperty(file)) {
          continue
        }

        if (!files[file]) {
          // No hash provided, so can't compare files
          continue
        }

        const localHash = getFileHash(file)

        if (!localHash) {
          // Unknown local file, request contents
          spark.emit('get-file', file)
          return
        }

        if (localHash !== files[file]) {
          handleConflict(file)
        }
      }
    })

    spark.on('file', ({filename, contents}) => {
      // TODO: `filename` validation
      // TODO: `filename` must be relative to scripts path
      fs.writeFile(filename, contents)
    })

    spark.on('get-file', (filename) => {
      fs.readFile(filename, (error, contents) => {
        if (error) {
          // TODO: Better error
          console.error(error)
        }
        spark.emit('file', {filename, contents})
      })
    })

    // Callback triggered on every file change
    // TODO: `watch` function
    // TODO: correct glob relative to scripts directory
    watch('/**/*.js', (filename) => {
      fs.readFile(filename, (error, contents) => {
        if (error) {
          // TODO: Better error
          console.error(error)
        }
        spark.emit('file', {filename, contents})
      })
    })
  })

  httpServer.listen(port)

  return {
    scripts: directory,
    port,
    stop: () => {
      // close Websockets only
      socketServer.destroy({close: false})
      // close underlying http server
      httpServer.shutdown()
    }
  }
}
