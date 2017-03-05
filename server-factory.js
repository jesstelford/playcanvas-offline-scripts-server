const http = require('http')
const Primus = require('primus')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const httpShutdown = require('http-shutdown')

const primusConfig = require('./primus-config')

module.exports = function serverFactory ({directory, port, socketConnector}) {
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

  socketServer.on('connection', socketConnector)

  httpServer.listen(port)

  return () => {
    // close Websockets only
    socketServer.destroy({close: false})
    // close underlying http server
    httpServer.shutdown()
  }
}
