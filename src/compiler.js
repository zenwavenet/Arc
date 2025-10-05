const { Lexer } = require('./lexer')
const { Parser } = require('./parser')
const path = require('path')
const fs = require('fs')

class CodeGenerator {
  constructor(ast, opts = {}) {
    this.ast = ast
    this.opts = opts
    this.imports = new Map()
    this.stdlibPath = path.join(__dirname, 'stdlib')
  }
  
  generate() {
    let code = ''
    
    if (this.ast.imports && this.ast.imports.length > 0) {
      for (const imp of this.ast.imports) {
        const varName = this.resolveImportName(imp)
        const importPath = this.resolveImportPath(imp.path)
        code += `const ${varName} = require('${importPath}');\n`
      }
      code += '\n'
    }
    
    for (const stmt of this.ast.statements) {
      code += this.generateStatement(stmt)
    }
    
    return code
  }
  
  resolveImportName(imp) {
    if (imp.alias) return imp.alias
    
    const stdlibs = ['io', 'http', 'fs', 'path', 'fmt', 'json', 'time', 
                     'strings', 'math', 'os', 'regex', 'crypto', 'arrays']
    
    if (stdlibs.includes(imp.path)) {
      return imp.path
    }
    
    const basename = path.basename(imp.path, '.arc')
    return basename.replace(/[^a-zA-Z0-9_]/g, '_')
  }
  
  resolveImportPath(importPath) {
    const stdlibs = ['io', 'http', 'fs', 'path', 'fmt', 'json', 'time', 
                     'strings', 'math', 'os', 'regex', 'crypto', 'arrays']
    
    if (stdlibs.includes(importPath)) {
      return path.join(this.stdlibPath, importPath)
    }
    
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const basePath = this.opts.filename ? path.dirname(this.opts.filename) : process.cwd()
      let fullPath = path.resolve(basePath, importPath)
      
      if (fs.existsSync(fullPath + '.arc')) {
        const arcSrc = fs.readFileSync(fullPath + '.arc', 'utf8')
        const compiled = compileArcToJS(arcSrc, { filename: fullPath + '.arc' })
        const jsPath = fullPath + '.js'
        fs.writeFileSync(jsPath, compiled, 'utf8')
        return jsPath
      } else if (fs.existsSync(fullPath + '.js')) {
        return fullPath + '.js'
      } else if (fs.existsSync(fullPath)) {
        return fullPath
      }
      
      return fullPath
    }
    
    return importPath
  }
  
  generateStatement(stmt) {
    switch (stmt.type) {
      case 'FunctionDecl':
        return this.generateFunctionDecl(stmt)
      case 'VariableDecl':
        return this.generateVariableDecl(stmt)
      case 'ReturnStatement':
        return this.generateReturn(stmt)
      case 'IfStatement':
        return this.generateIf(stmt)
      case 'ForStatement':
        return this.generateFor(stmt)
      case 'WhileStatement':
        return this.generateWhile(stmt)
      case 'BlockStatement':
        return this.generateBlock(stmt)
      case 'ExpressionStatement':
        return this.generateExpression(stmt.expression) + ';\n'
      default:
        throw new Error(`Unknown statement type: ${stmt.type}`)
    }
  }
  
  generateFunctionDecl(stmt) {
    const params = stmt.params.join(', ')
    const body = this.generateBlock(stmt.body)
    return `function ${stmt.name}(${params}) ${body}\n`
  }
  
  generateVariableDecl(stmt) {
    const init = stmt.initializer ? ' = ' + this.generateExpression(stmt.initializer) : ''
    return `${stmt.kind} ${stmt.name}${init};\n`
  }
  
  generateReturn(stmt) {
    const value = stmt.value ? ' ' + this.generateExpression(stmt.value) : ''
    return `return${value};\n`
  }
  
  generateIf(stmt) {
    const condition = this.generateExpression(stmt.condition)
    const thenBlock = this.generateBlock(stmt.thenBlock)
    let code = `if (${condition}) ${thenBlock}`
    if (stmt.elseBlock) {
      code += ' else ' + this.generateBlock(stmt.elseBlock)
    }
    return code + '\n'
  }
  
  generateFor(stmt) {
    let init = stmt.init ? this.generateStatement(stmt.init).trim() : ''
    if (init.endsWith(';')) {
      init = init.slice(0, -1)
    }
    const condition = stmt.condition ? this.generateExpression(stmt.condition) : ''
    const update = stmt.update ? this.generateExpression(stmt.update) : ''
    const body = this.generateBlock(stmt.body)
    return `for (${init}; ${condition}; ${update}) ${body}\n`
  }
  
  generateWhile(stmt) {
    const condition = this.generateExpression(stmt.condition)
    const body = this.generateBlock(stmt.body)
    return `while (${condition}) ${body}\n`
  }
  
  generateBlock(stmt) {
    let code = '{\n'
    for (const s of stmt.statements) {
      code += '  ' + this.generateStatement(s).replace(/\n/g, '\n  ')
    }
    code += '}'
    return code
  }
  
  generateExpression(expr) {
    switch (expr.type) {
      case 'BinaryExpression':
        return this.generateBinary(expr)
      case 'UnaryExpression':
        return this.generateUnary(expr)
      case 'CallExpression':
        return this.generateCall(expr)
      case 'MemberExpression':
        return this.generateMember(expr)
      case 'OptionalMemberExpression':
        return this.generateOptionalMember(expr)
      case 'ConditionalExpression':
        return this.generateConditional(expr)
      case 'Identifier':
        return expr.name
      case 'Literal':
        return this.generateLiteral(expr)
      case 'ArrayExpression':
        return this.generateArray(expr)
      case 'ObjectExpression':
        return this.generateObject(expr)
      case 'FunctionExpression':
        return this.generateFunctionExpression(expr)
      case 'TemplateStringExpression':
        return this.generateTemplateString(expr)
      default:
        throw new Error(`Unknown expression type: ${expr.type}`)
    }
  }
  
  generateBinary(expr) {
    const left = this.generateExpression(expr.left)
    const right = this.generateExpression(expr.right)
    return `(${left} ${expr.operator} ${right})`
  }
  
  generateUnary(expr) {
    const operand = this.generateExpression(expr.operand)
    return `(${expr.operator}${operand})`
  }
  
  generateCall(expr) {
    const callee = this.generateExpression(expr.callee)
    const args = expr.args.map(arg => {
      if (arg.type === 'SpreadElement') {
        return '...' + this.generateExpression(arg.argument)
      }
      return this.generateExpression(arg)
    }).join(', ')
    
    if (callee === 'println') {
      return `console.log(${args})`
    }
    
    return `${callee}(${args})`
  }
  
  generateMember(expr) {
    const object = this.generateExpression(expr.object)
    if (expr.computed) {
      const property = this.generateExpression(expr.property)
      return `${object}[${property}]`
    } else {
      if (expr.property.type === 'Identifier') {
        return `${object}.${expr.property.name}`
      } else {
        const property = this.generateExpression(expr.property)
        return `${object}[${property}]`
      }
    }
  }
  
  generateOptionalMember(expr) {
    const object = this.generateExpression(expr.object)
    if (expr.property.type === 'Identifier') {
      return `${object}?.${expr.property.name}`
    } else {
      const property = this.generateExpression(expr.property)
      return `${object}?.[${property}]`
    }
  }
  
  generateConditional(expr) {
    const test = this.generateExpression(expr.test)
    const consequent = this.generateExpression(expr.consequent)
    const alternate = this.generateExpression(expr.alternate)
    return `(${test} ? ${consequent} : ${alternate})`
  }
  
  generateLiteral(expr) {
    if (typeof expr.value === 'string') {
      return JSON.stringify(expr.value)
    }
    return String(expr.value)
  }
  
  generateArray(expr) {
    const elements = expr.elements.map(el => {
      if (el.type === 'SpreadElement') {
        return `...${this.generateExpression(el.argument)}`
      }
      return this.generateExpression(el)
    }).join(', ')
    return `[${elements}]`
  }
  
  generateObject(expr) {
    const props = expr.properties.map(p => {
      if (p.type === 'spread') {
        return `...${this.generateExpression(p.value)}`
      }
      const value = this.generateExpression(p.value)
      return `${p.key}: ${value}`
    }).join(', ')
    return `{${props}}`
  }
  
  generateFunctionExpression(expr) {
    const params = expr.params.join(', ')
    const body = this.generateBlock(expr.body)
    return `function(${params}) ${body}`
  }
  
  generateTemplateString(expr) {
    if (expr.parts.length === 0 && expr.expressions.length === 0) {
      return '""'
    }
    
    const result = []
    
    for (let i = 0; i < expr.parts.length; i++) {
      if (expr.parts[i]) {
        result.push(JSON.stringify(expr.parts[i]))
      }
      
      if (i < expr.expressions.length) {
        const exprStr = expr.expressions[i]
        const { Lexer } = require('./lexer')
        const { Parser } = require('./parser')
        const lexer = new Lexer(exprStr)
        const tokens = lexer.tokenize()
        const parser = new Parser(tokens)
        const ast = parser.parseExpression()
        result.push(`(${this.generateExpression(ast)})`)
      }
    }
    
    return result.join(' + ')
  }
}

function compileArcToJS(src, opts = {}) {
  try {
    const lexer = new Lexer(src)
    const tokens = lexer.tokenize()
    
    const parser = new Parser(tokens)
    const ast = parser.parse()

    const generator = new CodeGenerator(ast, opts)
    return generator.generate()
  } catch (err) {
    throw new Error(`Compilation error: ${err.message}`)
  }
}

module.exports = { compileArcToJS, CodeGenerator }
