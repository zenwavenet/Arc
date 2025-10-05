class Regex {
  static match(pattern, str, flags = '') {
    try {
      const regex = new RegExp(pattern, flags)
      const match = str.match(regex)
      return { matches: match, error: null }
    } catch (e) {
      return { matches: null, error: e.message }
    }
  }
  
  static matchAll(pattern, str, flags = 'g') {
    try {
      const regex = new RegExp(pattern, flags)
      const matches = [...str.matchAll(regex)]
      return { matches, error: null }
    } catch (e) {
      return { matches: null, error: e.message }
    }
  }
  
  static test(pattern, str, flags = '') {
    try {
      const regex = new RegExp(pattern, flags)
      return regex.test(str)
    } catch (e) {
      return false
    }
  }
  
  static replace(pattern, str, replacement, flags = '') {
    try {
      const regex = new RegExp(pattern, flags)
      return { result: str.replace(regex, replacement), error: null }
    } catch (e) {
      return { result: null, error: e.message }
    }
  }
  
  static replaceAll(pattern, str, replacement, flags = 'g') {
    try {
      const regex = new RegExp(pattern, flags)
      return { result: str.replace(regex, replacement), error: null }
    } catch (e) {
      return { result: null, error: e.message }
    }
  }
  
  static split(pattern, str, flags = '') {
    try {
      const regex = new RegExp(pattern, flags)
      return { parts: str.split(regex), error: null }
    } catch (e) {
      return { parts: null, error: e.message }
    }
  }
  
  static escape(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  
  static isEmail(str) {
    return this.test(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, str)
  }
  
  static isURL(str) {
    return this.test(/^https?:\/\/.+/, str)
  }
  
  static isIPv4(str) {
    return this.test(/^(\d{1,3}\.){3}\d{1,3}$/, str)
  }
  
  static isHex(str) {
    return this.test(/^[0-9a-fA-F]+$/, str)
  }
  
  static isAlpha(str) {
    return this.test(/^[a-zA-Z]+$/, str)
  }
  
  static isAlphanumeric(str) {
    return this.test(/^[a-zA-Z0-9]+$/, str)
  }
  
  static isNumeric(str) {
    return this.test(/^\d+$/, str)
  }
}

module.exports = Regex
