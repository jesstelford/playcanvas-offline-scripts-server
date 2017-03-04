const path = require('path')
const http = require('http')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const httpShutdown = require('http-shutdown')

const PORT = 51000

module.exports = function server ({scripts, port = PORT} = {}) {
  // Accept both relative & absolute paths, defaulting to `process.cwd()`
  const directory = path.resolve(scripts || '')

  const serve = serveStatic(directory, {index: false})

  const server = httpShutdown(http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res))
  }))

  server.listen(port)

  return {
    scripts: directory,
    port,
    stop: () => server.shutdown()
  }
}
