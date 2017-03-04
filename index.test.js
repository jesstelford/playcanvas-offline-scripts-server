/* eslint-env jest */
const path = require('path')
const server = require('./')

describe('Scripts path', () => {
  it('defaults to cwd when no options provided', () => {
    const app = server()
    expect(app.scripts).toBe(process.cwd())
  })

  it('defaults to cwd when empty options provided', () => {
    const app = server({})
    expect(app.scripts).toBe(process.cwd())
  })

  it('accepts an absolute path', () => {
    const app = server({scripts: '/dev/foo'})
    expect(app.scripts).toBe('/dev/foo')
  })

  it('accepts a relative path', () => {
    const app = server({scripts: './dev/foo'})
    expect(app.scripts).toBe(path.join(process.cwd(), './dev/foo'))
  })
})
