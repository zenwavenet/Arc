const path = require('path')

const pathModule = {
  join: function(...segments) {
    return path.join(...segments)
  },
  
  resolve: function(...segments) {
    return path.resolve(...segments)
  },
  
  dirname: function(filepath) {
    return path.dirname(filepath)
  },
  
  basename: function(filepath, ext) {
    return path.basename(filepath, ext)
  },
  
  extname: function(filepath) {
    return path.extname(filepath)
  },
  
  parse: function(filepath) {
    return path.parse(filepath)
  },
  
  format: function(pathObject) {
    return path.format(pathObject)
  },
  
  isAbsolute: function(filepath) {
    return path.isAbsolute(filepath)
  },
  
  normalize: function(filepath) {
    return path.normalize(filepath)
  },
  
  relative: function(from, to) {
    return path.relative(from, to)
  },
  
  sep: path.sep,
  
  delimiter: path.delimiter
}

module.exports = pathModule
