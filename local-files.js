const fs = require('fs')

module.exports = {
  onIncomingFile: (filename, content, done) => {
    fs.writeFile(filename, content, done)
  },

  onIncomingFileRemove: (filename, done) => {
    fs.unlink(filename, done)
  }
}
