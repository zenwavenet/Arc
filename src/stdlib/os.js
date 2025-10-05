const os = require('os')
const { execSync, spawn } = require('child_process')
const process = require('process')

class OS {
  static platform() {
    return process.platform
  }
  
  static arch() {
    return process.arch
  }
  
  static hostname() {
    return os.hostname()
  }
  
  static cpus() {
    return os.cpus()
  }
  
  static cpuCount() {
    return os.cpus().length
  }
  
  static totalMemory() {
    return os.totalmem()
  }
  
  static freeMemory() {
    return os.freemem()
  }
  
  static uptime() {
    return os.uptime()
  }
  
  static homeDir() {
    return os.homedir()
  }
  
  static tmpDir() {
    return os.tmpdir()
  }
  
  static env(key) {
    return process.env[key]
  }
  
  static setEnv(key, value) {
    process.env[key] = value
  }
  
  static getEnv(key, defaultValue) {
    return process.env[key] || defaultValue
  }
  
  static exit(code = 0) {
    process.exit(code)
  }
  
  static cwd() {
    return process.cwd()
  }
  
  static chdir(path) {
    try {
      process.chdir(path)
      return { error: null }
    } catch (e) {
      return { error: e.message }
    }
  }
  
  static exec(command) {
    try {
      const output = execSync(command, { encoding: 'utf8' })
      return { output, error: null }
    } catch (e) {
      return { output: null, error: e.message }
    }
  }
  
  static spawn(command, args = []) {
    return spawn(command, args, {
      stdio: 'inherit'
    })
  }
  
  static args() {
    return process.argv.slice(2)
  }
  
  static pid() {
    return process.pid
  }
  
  static ppid() {
    return process.ppid
  }
  
  static kill(pid, signal = 'SIGTERM') {
    try {
      process.kill(pid, signal)
      return { error: null }
    } catch (e) {
      return { error: e.message }
    }
  }
  
  static getUser() {
    return os.userInfo()
  }
  
  static username() {
    return os.userInfo().username
  }
  
  static nodeVersion() {
    return process.version
  }
}

module.exports = OS
