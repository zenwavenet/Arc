const http = require('http')
const https = require('https')
const url = require('url')
const querystring = require('querystring')

class Request {
  constructor(req) {
    this._req = req
    this.method = req.method
    this.url = req.url
    const parsed = url.parse(req.url, true)
    this.path = parsed.pathname
    this.query = parsed.query
    this.headers = req.headers
    this.body = null
  }
  
  async parseBody() {
    if (this.body !== null) return this.body
    
    return new Promise((resolve, reject) => {
      let body = ''
      this._req.on('data', chunk => { body += chunk })
      this._req.on('end', () => {
        this.body = body
        resolve(body)
      })
      this._req.on('error', reject)
    })
  }
  
  async parseJSON() {
    const body = await this.parseBody()
    try {
      return JSON.parse(body)
    } catch (err) {
      throw new Error('Invalid JSON in request body')
    }
  }
  
  async parseForm() {
    const body = await this.parseBody()
    return querystring.parse(body)
  }
  
  header(name) {
    return this.headers[name.toLowerCase()]
  }
}

class Response {
  constructor(res) {
    this._res = res
    this.statusCode = 200
    this.headers = {}
    this._ended = false
  }
  
  status(code) {
    this.statusCode = code
    return this
  }
  
  header(name, value) {
    this.headers[name] = value
    return this
  }
  
  send(data) {
    if (this._ended) return
    this._ended = true
    
    if (!this.headers['Content-Type']) {
      if (typeof data === 'string') {
        this.headers['Content-Type'] = 'text/plain'
      } else {
        this.headers['Content-Type'] = 'application/octet-stream'
      }
    }
    
    this._res.writeHead(this.statusCode, this.headers)
    this._res.end(data)
  }
  
  json(data) {
    if (this._ended) return
    this.headers['Content-Type'] = 'application/json'
    this.send(JSON.stringify(data))
  }
  
  html(data) {
    if (this._ended) return
    this.headers['Content-Type'] = 'text/html'
    this.send(data)
  }
  
  redirect(location, code = 302) {
    if (this._ended) return
    this._ended = true
    this._res.writeHead(code, { 'Location': location })
    this._res.end()
  }
}

class Router {
  constructor() {
    this.routes = []
  }
  
  addRoute(method, path, handler) {
    this.routes.push({ method, path, handler })
  }
  
  get(path, handler) {
    this.addRoute('GET', path, handler)
  }
  
  post(path, handler) {
    this.addRoute('POST', path, handler)
  }
  
  put(path, handler) {
    this.addRoute('PUT', path, handler)
  }
  
  delete(path, handler) {
    this.addRoute('DELETE', path, handler)
  }
  
  async handle(req, res) {
    for (const route of this.routes) {
      if (route.method === req.method && this.matchPath(route.path, req.path)) {
        try {
          await route.handler(req, res)
          return
        } catch (err) {
          res.status(500).send(`Internal Server Error: ${err.message}`)
          return
        }
      }
    }
    res.status(404).send('Not Found')
  }
  
  matchPath(pattern, path) {
    if (pattern === path) return true
    
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)
      return path.startsWith(prefix)
    }
    
    return false
  }
}

class Server {
  constructor(handler) {
    this.handler = handler
    this.server = null
  }
  
  listen(port, host = '0.0.0.0', callback) {
    this.server = http.createServer(async (req, res) => {
      const request = new Request(req)
      const response = new Response(res)
      
      try {
        await this.handler(request, response)
      } catch (err) {
        if (!response._ended) {
          response.status(500).send(`Internal Server Error: ${err.message}`)
        }
      }
    })
    
    this.server.listen(port, host, () => {
      if (callback) callback()
    })
    
    return this.server
  }
  
  close() {
    if (this.server) {
      this.server.close()
    }
  }
}

async function get(urlString, options = {}) {
  return request('GET', urlString, options)
}

async function post(urlString, options = {}) {
  return request('POST', urlString, options)
}

async function request(method, urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(urlString)
    const isHttps = parsed.protocol === 'https:'
    const client = isHttps ? https : http
    
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.path,
      method: method,
      headers: options.headers || {}
    }
    
    const req = client.request(reqOptions, (res) => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          json: function() {
            return JSON.parse(body)
          }
        })
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

class SimpleServer {
  constructor() {
    this.router = new Router()
    this._server = null
    this._notFoundHandler = null
  }
  
  get(path, handler) {
    this.router.get(path, handler)
    return this
  }
  
  post(path, handler) {
    this.router.post(path, handler)
    return this
  }
  
  put(path, handler) {
    this.router.put(path, handler)
    return this
  }
  
  delete(path, handler) {
    this.router.delete(path, handler)
    return this
  }
  
  notFound(handler) {
    this._notFoundHandler = handler
    return this
  }
  
  listen(port, host = '0.0.0.0', callback) {
    const server = new Server(async (req, res) => {
      let handled = false
      for (const route of this.router.routes) {
        if (route.method === req.method && this.router.matchPath(route.path, req.path)) {
          try {
            await route.handler(req, res)
            handled = true
            return
          } catch (err) {
            res.status(500).send(`Internal Server Error: ${err.message}`)
            return
          }
        }
      }
      
      if (!handled) {
        if (this._notFoundHandler) {
          await this._notFoundHandler(req, res)
        } else {
          res.status(404).send('Not Found')
        }
      }
    })
    this._server = server.listen(port, host, callback)
    return this._server
  }
  
  close() {
    if (this._server) {
      this._server.close()
    }
  }
}

const httpModule = {
  Server,
  Router,
  Request,
  Response,
  SimpleServer,
  
  createServer: function() {
    return new SimpleServer()
  },
  
  listenAndServe: function(port, handler, host = '0.0.0.0') {
    const server = new Server(handler)
    return server.listen(port, host, () => {
      console.log(`Server listening on ${host}:${port}`)
    })
  },
  
  newRouter: function() {
    return new Router()
  },
  
  get,
  post,
  request,
  
  StatusOK: 200,
  StatusCreated: 201,
  StatusNoContent: 204,
  StatusBadRequest: 400,
  StatusUnauthorized: 401,
  StatusForbidden: 403,
  StatusNotFound: 404,
  StatusMethodNotAllowed: 405,
  StatusInternalServerError: 500,
  StatusBadGateway: 502,
  StatusServiceUnavailable: 503
}

module.exports = httpModule
