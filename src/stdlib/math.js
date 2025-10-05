const crypto = require('crypto')

class Math {
  static abs(x) {
    return global.Math.abs(x)
  }
  
  static ceil(x) {
    return global.Math.ceil(x)
  }
  
  static floor(x) {
    return global.Math.floor(x)
  }
  
  static round(x) {
    return global.Math.round(x)
  }
  
  static max(...args) {
    return global.Math.max(...args)
  }
  
  static min(...args) {
    return global.Math.min(...args)
  }
  
  static pow(x, y) {
    return global.Math.pow(x, y)
  }
  
  static sqrt(x) {
    return global.Math.sqrt(x)
  }
  
  static sin(x) {
    return global.Math.sin(x)
  }
  
  static cos(x) {
    return global.Math.cos(x)
  }
  
  static tan(x) {
    return global.Math.tan(x)
  }
  
  static log(x) {
    return global.Math.log(x)
  }
  
  static log10(x) {
    return global.Math.log10(x)
  }
  
  static exp(x) {
    return global.Math.exp(x)
  }
  
  static random() {
    return global.Math.random()
  }
  
  static randomInt(min, max) {
    return global.Math.floor(global.Math.random() * (max - min + 1)) + min
  }
  
  static randomRange(min, max) {
    return global.Math.random() * (max - min) + min
  }
  
  static clamp(value, min, max) {
    return global.Math.max(min, global.Math.min(max, value))
  }
  
  static lerp(start, end, t) {
    return start + (end - start) * t
  }
  
  static map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
  }
  
  static sum(arr) {
    return arr.reduce((a, b) => a + b, 0)
  }
  
  static avg(arr) {
    return this.sum(arr) / arr.length
  }
  
  static median(arr) {
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = global.Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  }
  
  static mode(arr) {
    const freq = {}
    let maxFreq = 0
    let mode = null
    
    for (const num of arr) {
      freq[num] = (freq[num] || 0) + 1
      if (freq[num] > maxFreq) {
        maxFreq = freq[num]
        mode = num
      }
    }
    
    return mode
  }
  
  static stddev(arr) {
    const mean = this.avg(arr)
    const variance = arr.reduce((sum, x) => sum + global.Math.pow(x - mean, 2), 0) / arr.length
    return global.Math.sqrt(variance)
  }
}

Math.PI = global.Math.PI
Math.E = global.Math.E

module.exports = Math
