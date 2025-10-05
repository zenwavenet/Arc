const crypto = require('crypto')

class Strings {
  static contains(str, substr) {
    return str.includes(substr)
  }
  
  static hasPrefix(str, prefix) {
    return str.startsWith(prefix)
  }
  
  static hasSuffix(str, suffix) {
    return str.endsWith(suffix)
  }
  
  static startsWith(str, prefix) {
    return str.startsWith(prefix)
  }
  
  static endsWith(str, suffix) {
    return str.endsWith(suffix)
  }
  
  static indexOf(str, substr) {
    return str.indexOf(substr)
  }
  
  static split(str, sep) {
    return str.split(sep)
  }
  
  static substring(str, start, end) {
    return str.substring(start, end)
  }
  
  static join(arr, sep) {
    return arr.join(sep)
  }
  
  static trim(str) {
    return str.trim()
  }
  
  static trimLeft(str) {
    return str.trimStart()
  }
  
  static trimRight(str) {
    return str.trimEnd()
  }
  
  static toLower(str) {
    return str.toLowerCase()
  }
  
  static toUpper(str) {
    return str.toUpperCase()
  }
  
  static lower(str) {
    return str.toLowerCase()
  }
  
  static upper(str) {
    return str.toUpperCase()
  }
  
  static replace(str, old, newStr) {
    return str.replace(old, newStr)
  }
  
  static replaceAll(str, old, newStr) {
    return str.replaceAll(old, newStr)
  }
  
  static repeat(str, count) {
    return str.repeat(count)
  }
  
  static reverse(str) {
    return str.split('').reverse().join('')
  }
  
  static lines(str) {
    return str.split('\n')
  }
  
  static words(str) {
    return str.trim().split(/\s+/)
  }
  
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  
  static titleCase(str) {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }
  
  static slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  
  static truncate(str, maxLen, suffix = '...') {
    if (str.length <= maxLen) return str
    return str.slice(0, maxLen - suffix.length) + suffix
  }
  
  static padLeft(str, width, char = ' ') {
    return str.padStart(width, char)
  }
  
  static padRight(str, width, char = ' ') {
    return str.padEnd(width, char)
  }
  
  static pad(str, width, char = ' ') {
    const totalPad = width - str.length
    if (totalPad <= 0) return str
    const leftPad = Math.floor(totalPad / 2)
    const rightPad = totalPad - leftPad
    return char.repeat(leftPad) + str + char.repeat(rightPad)
  }
  
  static count(str, substr) {
    return (str.match(new RegExp(substr, 'g')) || []).length
  }
}

module.exports = Strings
