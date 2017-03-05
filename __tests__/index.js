/* eslint-env jest */

jest.mock('../sparky', () => {
  return jest.fn(() => {})
})

const path = require('path')
const portscanner = require('portscanner')

const server = require('../')

const DEFAULT_PORT = 51000

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

describe('Stopping the server', () => {
  it('works', () => {
    const app = server()
    app.stop()

    return portscanner.checkPortStatus(DEFAULT_PORT)
      .then(status => expect(status).toBe('closed'))
  })
})
