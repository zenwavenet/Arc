class Arrays {
  static map(arr, fn) {
    return arr.map(fn)
  }
  
  static filter(arr, fn) {
    return arr.filter(fn)
  }
  
  static reduce(arr, fn, initial) {
    return arr.reduce(fn, initial)
  }
  
  static find(arr, fn) {
    return arr.find(fn)
  }
  
  static findIndex(arr, fn) {
    return arr.findIndex(fn)
  }
  
  static every(arr, fn) {
    return arr.every(fn)
  }
  
  static some(arr, fn) {
    return arr.some(fn)
  }
  
  static sort(arr, fn) {
    return [...arr].sort(fn)
  }
  
  static reverse(arr) {
    return [...arr].reverse()
  }
  
  static unique(arr) {
    return [...new Set(arr)]
  }
  
  static flatten(arr, depth = 1) {
    return arr.flat(depth)
  }
  
  static flatMap(arr, fn) {
    return arr.flatMap(fn)
  }
  
  static chunk(arr, size) {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }
  
  static zip(...arrays) {
    const minLen = Math.min(...arrays.map(a => a.length))
    const result = []
    for (let i = 0; i < minLen; i++) {
      result.push(arrays.map(a => a[i]))
    }
    return result
  }
  
  static unzip(arr) {
    if (arr.length === 0) return []
    return arr[0].map((_, i) => arr.map(row => row[i]))
  }
  
  static range(start, end, step = 1) {
    const result = []
    for (let i = start; i < end; i += step) {
      result.push(i)
    }
    return result
  }
  
  static shuffle(arr) {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
  
  static sample(arr, n = 1) {
    const shuffled = this.shuffle(arr)
    return n === 1 ? shuffled[0] : shuffled.slice(0, n)
  }
  
  static partition(arr, fn) {
    const pass = []
    const fail = []
    for (const item of arr) {
      (fn(item) ? pass : fail).push(item)
    }
    return [pass, fail]
  }
  
  static groupBy(arr, fn) {
    const groups = {}
    for (const item of arr) {
      const key = fn(item)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }
  
  static countBy(arr, fn) {
    const counts = {}
    for (const item of arr) {
      const key = fn(item)
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }
  
  static intersection(...arrays) {
    if (arrays.length === 0) return []
    const [first, ...rest] = arrays
    return first.filter(item => rest.every(arr => arr.includes(item)))
  }
  
  static union(...arrays) {
    return this.unique(arrays.flat())
  }
  
  static difference(arr1, arr2) {
    return arr1.filter(item => !arr2.includes(item))
  }
  
  static take(arr, n) {
    return arr.slice(0, n)
  }
  
  static takeLast(arr, n) {
    return arr.slice(-n)
  }
  
  static takeWhile(arr, fn) {
    const result = []
    for (const item of arr) {
      if (!fn(item)) break
      result.push(item)
    }
    return result
  }
  
  static drop(arr, n) {
    return arr.slice(n)
  }
  
  static dropLast(arr, n) {
    return arr.slice(0, -n)
  }
  
  static dropWhile(arr, fn) {
    let i = 0
    while (i < arr.length && fn(arr[i])) {
      i++
    }
    return arr.slice(i)
  }
  
  static compact(arr) {
    return arr.filter(Boolean)
  }
  
  static min(arr) {
    return Math.min(...arr)
  }
  
  static max(arr) {
    return Math.max(...arr)
  }
}

module.exports = Arrays
