const crypto = require('crypto')

class Crypto {
  static hash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex')
  }
  
  static md5(data) {
    return this.hash(data, 'md5')
  }
  
  static sha1(data) {
    return this.hash(data, 'sha1')
  }
  
  static sha256(data) {
    return this.hash(data, 'sha256')
  }
  
  static sha512(data) {
    return this.hash(data, 'sha512')
  }
  
  static hmac(data, secret, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex')
  }
  
  static randomBytes(size) {
    return crypto.randomBytes(size)
  }
  
  static randomHex(size) {
    return crypto.randomBytes(size).toString('hex')
  }
  
  static randomBase64(size) {
    return crypto.randomBytes(size).toString('base64')
  }
  
  static uuid() {
    return crypto.randomUUID()
  }
  
  static base64Encode(str) {
    return Buffer.from(str).toString('base64')
  }
  
  static base64Decode(str) {
    try {
      return { data: Buffer.from(str, 'base64').toString('utf8'), error: null }
    } catch (e) {
      return { data: null, error: e.message }
    }
  }
  
  static hexEncode(str) {
    return Buffer.from(str).toString('hex')
  }
  
  static hexDecode(str) {
    try {
      return { data: Buffer.from(str, 'hex').toString('utf8'), error: null }
    } catch (e) {
      return { data: null, error: e.message }
    }
  }
  
  static encrypt(text, password, algorithm = 'aes-256-cbc') {
    try {
      const key = crypto.scryptSync(password, 'salt', 32)
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv(algorithm, key, iv)
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      return {
        data: {
          encrypted,
          iv: iv.toString('hex')
        },
        error: null
      }
    } catch (e) {
      return { data: null, error: e.message }
    }
  }
  
  static decrypt(encrypted, iv, password, algorithm = 'aes-256-cbc') {
    try {
      const key = crypto.scryptSync(password, 'salt', 32)
      const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'))
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return { data: decrypted, error: null }
    } catch (e) {
      return { data: null, error: e.message }
    }
  }
  
  static pbkdf2(password, salt, iterations = 100000, keylen = 64, digest = 'sha512') {
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
  }
  
  static compareHash(data, hash, algorithm = 'sha256') {
    return this.hash(data, algorithm) === hash
  }
}

module.exports = Crypto
