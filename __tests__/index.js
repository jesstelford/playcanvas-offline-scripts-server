/* eslint-env jest */
const path = require('path')
const server = require('../')
const portscanner = require('portscanner')

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

describe('Serving files', () => {
  let app

  beforeEach(() => {
    app = server({scripts: './__tests__/fixtures'})
  })

  afterEach(() => {
    app.stop()
  })

  it('starts a server', () => (
    portscanner.checkPortStatus(51000)
      .then(status => expect(status).toBe('open'))
  ))

  it('serves a known file', () => (
    fetch('http://localhost:51000/doit.js')
      .then(res => {
        expect(res.ok).toBeTruthy()
        expect(res.status).toBe(200)
      })
  ))

  it('404s an unknown file', () => (
    fetch('http://localhost:51000/idontexist.txt')
      .then(res => {
        expect(res.ok).toBeFalsy()
        expect(res.status).toBe(404)
      })
  ))

  it('serves the contents of a js file', () => (
    fetch('http://localhost:51000/doit.js')
      .then(res => res.text())
      .then(res => {
        expect(res).toBe("console.log('Hi!')\n")
      })
  ))
})

describe('Stopping the server', () => {
  it('works', () => {
    const app = server()
    app.stop()

    return portscanner.checkPortStatus(51000)
      .then(status => expect(status).toBe('closed'))
  })
})