const util = require('util')

const fmt = {
  print: function(...args) {
    process.stdout.write(args.join(' '))
  },

  println: function(...args) {
    console.log(...args)
  },

  sprintf: function(format, ...args) {
    return util.format(format, ...args)
  },

  printf: function(format, ...args) {
    process.stdout.write(util.format(format, ...args))
  },
  
  eprint: function(...args) {
    process.stderr.write(args.join(' '))
  },
  
  eprintln: function(...args) {
    console.error(...args)
  },
  
  toString: function(value) {
    return String(value)
  },
  
  toJSON: function(value, indent = 2) {
    return JSON.stringify(value, null, indent)
  },
  
  parseJSON: function(str) {
    return JSON.parse(str)
  },
  
  formatNumber: function(num, decimals = 2) {
    return num.toFixed(decimals)
  }
}

module.exports = fmt
