const fs = require('fs')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const appendFileAsync = promisify(fs.appendFile)

const io = {
  readFile: async function(path) {
    try {
      return await readFileAsync(path, 'utf8')
    } catch (err) {
      throw new Error(`io.readFile: ${err.message}`)
    }
  },

  readFileBytes: async function(path) {
    try {
      return await readFileAsync(path)
    } catch (err) {
      throw new Error(`io.readFileBytes: ${err.message}`)
    }
  },

  writeFile: async function(path, data) {
    try {
      await writeFileAsync(path, data, 'utf8')
    } catch (err) {
      throw new Error(`io.writeFile: ${err.message}`)
    }
  },

  writeFileBytes: async function(path, data) {
    try {
      await writeFileAsync(path, data)
    } catch (err) {
      throw new Error(`io.writeFileBytes: ${err.message}`)
    }
  },

  appendFile: async function(path, data) {
    try {
      await appendFileAsync(path, data, 'utf8')
    } catch (err) {
      throw new Error(`io.appendFile: ${err.message}`)
    }
  },

  copyFile: async function(src, dest) {
    try {
      const data = await readFileAsync(src)
      await writeFileAsync(dest, data)
    } catch (err) {
      throw new Error(`io.copyFile: ${err.message}`)
    }
  },

  exists: function(path) {
    return fs.existsSync(path)
  },

  readDir: async function(path) {
    try {
      return await promisify(fs.readdir)(path)
    } catch (err) {
      throw new Error(`io.readDir: ${err.message}`)
    }
  },

  mkdir: async function(path, recursive = true) {
    try {
      await promisify(fs.mkdir)(path, { recursive })
    } catch (err) {
      throw new Error(`io.mkdir: ${err.message}`)
    }
  },

  remove: async function(path) {
    try {
      const stat = await promisify(fs.stat)(path)
      if (stat.isDirectory()) {
        await promisify(fs.rmdir)(path, { recursive: true })
      } else {
        await promisify(fs.unlink)(path)
      }
    } catch (err) {
      throw new Error(`io.remove: ${err.message}`)
    }
  },

  stat: async function(path) {
    try {
      const stat = await promisify(fs.stat)(path)
      return {
        size: stat.size,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        created: stat.birthtime,
        modified: stat.mtime
      }
    } catch (err) {
      throw new Error(`io.stat: ${err.message}`)
    }
  },
  
  readLine: async function() {
    return new Promise((resolve) => {
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('', (answer) => {
        rl.close()
        resolve(answer)
      })
    })
  }
}

module.exports = io
