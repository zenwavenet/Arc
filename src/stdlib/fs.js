const fs = require('fs')
const { promisify } = require('util')

const fsModule = {
  readFileSync: function(filepath) {
    return fs.readFileSync(filepath, 'utf8')
  },
  
  writeFileSync: function(filepath, data) {
    fs.writeFileSync(filepath, data, 'utf8')
  },
  
  existsSync: function(filepath) {
    return fs.existsSync(filepath)
  },
  
  statSync: function(filepath) {
    const stat = fs.statSync(filepath)
    return {
      size: stat.size,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      created: stat.birthtime,
      modified: stat.mtime
    }
  },
  
  readdirSync: function(dirpath) {
    return fs.readdirSync(dirpath)
  },
  
  mkdirSync: function(dirpath, recursive = true) {
    fs.mkdirSync(dirpath, { recursive })
  },
  
  unlinkSync: function(filepath) {
    fs.unlinkSync(filepath)
  },
  
  rmdirSync: function(dirpath, recursive = true) {
    fs.rmdirSync(dirpath, { recursive })
  },
  
  copyFileSync: function(src, dest) {
    fs.copyFileSync(src, dest)
  },
  
  renameSync: function(oldPath, newPath) {
    fs.renameSync(oldPath, newPath)
  },
  
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  stat: promisify(fs.stat),
  readdir: promisify(fs.readdir),
  mkdir: promisify(fs.mkdir),
  unlink: promisify(fs.unlink),
  rmdir: promisify(fs.rmdir),
  copyFile: promisify(fs.copyFile),
  rename: promisify(fs.rename),
  
  watch: function(filepath, callback) {
    return fs.watch(filepath, callback)
  }
}

module.exports = fsModule
