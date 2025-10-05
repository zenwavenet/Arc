const { performance } = require('perf_hooks')

class Time {
  static now() {
    return Date.now()
  }
  
  static nowUnix() {
    return Math.floor(Date.now() / 1000)
  }
  
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  static sleepSync(ms) {
    const start = Date.now()
    while (Date.now() - start < ms) {}
  }
  
  static format(timestamp, format = 'ISO') {
    const date = new Date(timestamp)
    
    if (format === 'ISO') {
      return date.toISOString()
    } else if (format === 'UTC') {
      return date.toUTCString()
    } else if (format === 'locale') {
      return date.toLocaleString()
    }
    
    const pad = (n) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }
  
  static parse(str) {
    const timestamp = Date.parse(str)
    if (isNaN(timestamp)) {
      return { data: null, error: 'Invalid date string' }
    }
    return { data: timestamp, error: null }
  }
  
  static measure(fn) {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    return { result, duration }
  }
  
  static async measureAsync(fn) {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    return { result, duration }
  }
}

class Timer {
  constructor() {
    this.start = performance.now()
    this.lastLap = this.start
  }
  
  elapsed() {
    return performance.now() - this.start
  }
  
  lap() {
    const now = performance.now()
    const lapTime = now - this.lastLap
    this.lastLap = now
    return lapTime
  }
  
  stop() {
    return performance.now() - this.start
  }
  
  reset() {
    this.start = performance.now()
    this.lastLap = this.start
  }
}

function newTimer() {
  return new Timer()
}

module.exports = {
  now: Time.now,
  nowUnix: Time.nowUnix,
  sleep: Time.sleepSync,
  format: Time.format,
  parse: Time.parse,
  measure: (startTime) => performance.now() - startTime,
  newTimer: newTimer
}
