/* eslint-env jest */
const Primus = require('primus')
const portscanner = require('portscanner')

const serverFactory = require('../server-factory')
const primusConfig = require('../primus-config')

const DEFAULT_PORT = 51000

/* global fetch */
require('isomorphic-fetch')

describe('return value', () => {
  let stop

  afterEach(() => {
    stop && stop()
  })

  it('returns a function', () => {
    stop = serverFactory({directory: process.cwd(), port: DEFAULT_PORT, socketConnector: () => {}})
    expect(stop).toEqual(expect.any(Function))
  })
})

describe('Options object', () => {
  let stop

  afterEach(() => {
    stop && stop()
  })

  it('requires all options', () => {
    // TODO
  })

  it('requires an absolute directory', () => {
    // TODO
  })
})

describe('Port', () => {
  let stop

  afterEach(() => {
    stop && stop()
  })

  it('starts on the given port', () => {
    stop = serverFactory({directory: process.cwd(), port: 3000, socketConnector: () => {}})
    return portscanner.checkPortStatus(3000)
      .then(status => expect(status).toBe('open'))
  })
})

describe('Serving files', () => {
  let stop

  beforeEach(() => {
    stop = serverFactory({directory: `${process.cwd()}/__tests__/fixtures`, port: DEFAULT_PORT, socketConnector: () => {}})
  })

  afterEach(() => {
    stop && stop()
  })

  it('serves a known file', () => (
    fetch(`http://localhost:${DEFAULT_PORT}/doit.js`)
      .then(res => {
        expect(res.ok).toBeTruthy()
        expect(res.status).toBe(200)
      })
  ))

  it('404s an unknown file', () => (
    fetch(`http://localhost:${DEFAULT_PORT}/idontexist.txt`)
      .then(res => {
        expect(res.ok).toBeFalsy()
        expect(res.status).toBe(404)
      })
  ))

  it('serves the contents of a js file', () => (
    fetch(`http://localhost:${DEFAULT_PORT}/doit.js`)
      .then(res => res.text())
      .then(res => {
        expect(res).toBe("console.log('Hi!')\n")
      })
  ))
})

describe('Serving files from bad directory', () => {
  let stop

  beforeEach(() => {
    stop = serverFactory({directory: '/idont/exist', port: DEFAULT_PORT, socketConnector: () => {}})
  })

  afterEach(() => {
    stop && stop()
  })

  it('404s file requests', () => (
    fetch(`http://localhost:${DEFAULT_PORT}/idontexist.txt`)
      .then(res => {
        expect(res.ok).toBeFalsy()
        expect(res.status).toBe(404)
      })
  ))
})

describe('Stopping the server', () => {
  it('works', () => {
    const stop = serverFactory({directory: process.cwd(), port: DEFAULT_PORT, socketConnector: () => {}})
    stop()

    return portscanner.checkPortStatus(DEFAULT_PORT)
      .then(status => expect(status).toBe('closed'))
  })
})

describe('Websockets', () => {
  let stop

  beforeEach(() => {
    stop = serverFactory({directory: process.cwd(), port: DEFAULT_PORT, socketConnector: () => {}})
  })

  afterEach(() => {
    stop && stop()
  })

  it('exposes client primus bundle', () => (
    fetch(`http://localhost:${DEFAULT_PORT}/primus/primus.js`)
      .then(res => {
        expect(res.ok).toBeTruthy()
        expect(res.status).toBe(200)
      })
  ))

  it('can connect web sockets', (done) => {
    const Socket = Primus.createSocket(primusConfig)
    const client = new Socket(`http://localhost:${DEFAULT_PORT}`)

    let opened = false
    client.on('open', () => {
      opened = true

      // Immediately destroy the connection to complete the test
      setImmediate(() => client.destroy())
    })

    client.on('destroy', () => {
      expect(opened).toBeTruthy()
      done()
    })

    // Fail test if there's an error connecting
    client.on('error', done)
  })
})

describe('Destroying websockets when server stopped', () => {
  let stop

  beforeEach(() => {
    stop = serverFactory({directory: process.cwd(), port: DEFAULT_PORT, socketConnector: () => {}})
  })

  it('destroys sockets', (done) => {
    const Socket = Primus.createSocket(primusConfig)
    const client = new Socket(`http://localhost:${DEFAULT_PORT}`)

    let opened = false
    client.on('open', () => {
      opened = true
    })

    client.on('destroy', () => {
      expect(opened).toBeTruthy()
      done()
    })

    // Fail test if there's an error connecting
    client.on('error', done)

    // Stop server on next tick
    // Should trigger `destroy` on socket
    setImmediate(stop)
  })

  it.skip('copmletes any streaming before destroying socket', () => {

  })
})
