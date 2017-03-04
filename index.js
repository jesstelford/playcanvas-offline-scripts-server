const path = require('path');

module.exports = function server({scripts} = {}) {

  // Accept both relative & absolute paths, defaulting to `process.cwd()`
  const directory = path.resolve(scripts || '');

  return {
    scripts: directory,
  };
}
