const path = require('path')
const http = require('http')
const Primus = require('primus')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const httpShutdown = require('http-shutdown')

const primusConfig = require('./primus-config')

const PORT = 51000

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
    spark.on('data', (data) => {
      // TODO
      console.log('received data from the client', data)
    })
  })

  httpServer.listen(port)

  return {
    scripts: directory,
    port,
    stop: () => httpServer.shutdown()
  }
}
