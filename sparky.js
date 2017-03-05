const upath = require('upath')
const Vinyl = require('vinyl')
const vinylFile = require('vinyl-file')
const through2Map = require('through2-map')
const readVinylFiles = require('read-vinyl-file-stream')

/*
function getFileHash (filePath) {
  return 'TODO: md5hash'
}

function outputConflict (filename, localContents, remoteContents) {
  // TODO: Use a diff algorithm to find what's changed, then console.error
  // it out with a message about refusing to merge
  console.log(`Conflict in ${filename}:\nLocal contents:\n\n${localContents}\n\nRemote Contents:\n\n${remoteContents}`)
}

function handleConflict (filename, remoteContents) {
  // TODO: Check file exists first. If not, just write it out (conflict
  // resolved!)
  fs.readFileSync(filename, (error, localContents) => {
    if (error) {
      // TODO: Better error message
      console.error(error)
      return
    }
    outputConflict(filename, localContents, remoteContents)
  })
}
*/

function streamLocalFile (filename, vinylOpts) {
  vinylFile
    .readSync(filename, vinylOpts)
}

function changedLocalContents (outStream, base, filename) {
  streamLocalFile(filename, {
    // we can't send a stream inside a stream over the network,
    // so go with a buffer
    buffer: true,
    // Use the correct base (ie; avoid default of process.cwd())
    base
  }).pipe(outStream)
}

function removedLocalContents (outStream, base, filename) {
  streamLocalFile(filename, {
    // The file is gone; don't read anything
    read: false,
    // Use the correct base (ie; avoid default of process.cwd())
    base
  }).pipe(outStream)
}

// Return a function to convert an incoming stream into a Vinyl file
// Note: The incoming stream should have it's contents as a Buffer / string
function convertStreamToVinyl () {
  return through2Map.obj(vinylStream => new Vinyl(Object.assign(
    {},
    vinylStream,
    {contents: vinylStream.contents ? new Buffer(vinylStream.contents) : null}
  )))
}

function setupOutgoingStreams ({watcher, directory, fileStream, fileRmStream}) {
  // Watch for file changes, additions, deletions
  // No need to watch directories; individual files are always triggered
  watcher
    .on('add', changedLocalContents.bind(null, fileStream, directory))
    .on('change', changedLocalContents.bind(null, fileStream, directory))
    .on('unlink', removedLocalContents.bind(null, fileRmStream, directory))
    .on('error', console.error.bind(console))
}

function setupIncomingStreams ({directory, fileStream, fileRmStream, onIncomingFile, onIncomingFileRemove}) {
  fileStream
    .pipe(convertStreamToVinyl)
    .pipe(readVinylFiles((content, file, stream, done) => {
      onIncomingFile(upath.join(directory, file.relative), content, done)
    }))

  fileRmStream
    .pipe(convertStreamToVinyl)
    .pipe(readVinylFiles((content, file, stream, done) => {
      onIncomingFileRemove(upath.join(directory, file.relative), done)
    }))
}

module.exports = ({watcher, directory, onIncomingFile, onIncomingFileRemove}) => (spark) => {
  // added or changed files will be streamed here
  const fileStream = spark.substream('file')

  // removed files will be streamed here
  const fileRmStream = spark.substream('file-rm')

  setupOutgoingStreams({
    watcher,
    directory,
    fileStream,
    fileRmStream
  })

  setupIncomingStreams({
    directory,
    fileStream,
    fileRmStream,
    onIncomingFile,
    onIncomingFileRemove
  })

  /*

  // Immediately trigger a sync
  spark.emit('sync', {
    'doit.js': getFileHash('doit.js')
  })

  spark.on('conflict', ({filename, contents}) => {
    handleConflict(filename, contents)
  })

  spark.on('sync', (files) => {
    for (let file in files) {
      if (!files.hasOwnProperty(file)) {
        continue
      }

      if (!files[file]) {
        // No hash provided, so can't compare files
        continue
      }

      const localHash = getFileHash(file)

      if (!localHash) {
        // Unknown local file, request contents
        spark.emit('get-file', file)
        return
      }

      if (localHash !== files[file]) {
        handleConflict(file)
      }
    }
  })

  spark.on('file', ({filename, contents}) => {
    // TODO: `filename` validation
    // TODO: `filename` must be relative to scripts path
    fs.writeFile(filename, contents)
  })

  spark.on('get-file', (filename) => {
    fs.readFile(filename, (error, contents) => {
      if (error) {
        // TODO: Better error
        console.error(error)
      }
      spark.emit('file', {filename, contents})
    })
  })
  */
}
