module.exports = {
  transformer: 'websockets', // Pure JS, doesn't need C++ toolchain to compile
  pathname: '/primus',
  iknowhttpsisbetter: true, // We'll only ever run this on `localhost`, so no certs
  plugin: {
    'events': require('primus-emit')
  }
}
