/* eslint-env jest */
const path = require('path')
const Primus = require('primus')
const portscanner = require('portscanner')

const server = require('../')
const primusConfig = require('../primus-config')

const DEFAULT_PORT = 51000

/* global fetch */
require('isomorphic-fetch')

describe('return value', () => {
  let app

  afterEach(() => {
    app.stop()
  })

  it('returns expected shape', () => {
    app = server()
    expect(app).toMatchObject({
      scripts: expect.any(String),
      stop: expect.any(Function)
    })
  })
})

describe('Scripts path', () => {
  let app

  afterEach(() => {
    app.stop()
  })

  it('defaults to cwd when no options provided', () => {
    app = server()
    expect(app.scripts).toBe(process.cwd())
  })

  it('defaults to cwd when empty options provided', () => {
    app = server({})
    expect(app.scripts).toBe(process.cwd())
  })

  it('accepts an absolute path', () => {
    app = server({scripts: '/dev/foo'})
    expect(app.scripts).toBe('/dev/foo')
  })

  it('accepts a relative path', () => {
    app = server({scripts: './dev/foo'})
    expect(app.scripts).toBe(path.join(process.cwd(), './dev/foo'))
  })
})

describe('Port', () => {
  let app

  afterEach(() => {
    app.stop()
  })

  it('starts on the default port', () => {
    app = server()
    return portscanner.checkPortStatus(DEFAULT_PORT)
      .then(status => expect(status).toBe('open'))
  })

  it('starts on the given port', () => {
    app = server({port: 3000})
    return portscanner.checkPortStatus(3000)
      .then(status => expect(status).toBe('open'))
  })
})

describe('Serving files', () => {
  let app

  beforeEach(() => {
    app = server({scripts: './__tests__/fixtures'})
  })

  afterEach(() => {
    app.stop()
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
  let app

  beforeEach(() => {
    app = server({scripts: '/tmp/idontexist'})
  })

  afterEach(() => {
    app.stop()
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
    const app = server()
    app.stop()

    return portscanner.checkPortStatus(DEFAULT_PORT)
      .then(status => expect(status).toBe('closed'))
  })
})

describe('Websockets', () => {
  let app

  beforeEach(() => {
    app = server({scripts: '/tmp/idontexist'})
  })

  afterEach(() => {
    app.stop()
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
    // eslint-disable-next-line no-unused-vars
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
