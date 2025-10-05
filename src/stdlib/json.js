const fs = require('fs')

class JSON {
  static parse(str) {
    try {
      return { data: global.JSON.parse(str), error: null }
    } catch (e) {
      return { data: null, error: e.message }
    }
  }
  
  static stringify(obj, pretty = false) {
    try {
      const str = pretty ? global.JSON.stringify(obj, null, 2) : global.JSON.stringify(obj)
      return { data: str, error: null }
    } catch (e) {
      return { data: null, error: e.message }
    }
  }
  
  static readFile(path) {
    try {
      const content = fs.readFileSync(path, 'utf8')
      const parsed = global.JSON.parse(content)
      return { data: parsed, error: null }
    } catch (e) {
      return { data: null, error: e.message }
    }
  }
  
  static writeFile(path, obj, pretty = true) {
    try {
      const str = pretty ? global.JSON.stringify(obj, null, 2) : global.JSON.stringify(obj)
      fs.writeFileSync(path, str, 'utf8')
      return { error: null }
    } catch (e) {
      return { error: e.message }
    }
  }
}

module.exports = JSON
