const { TokenType } = require('./lexer')

class ASTNode {
  constructor(type) {
    this.type = type
  }
}

class Program extends ASTNode {
  constructor(packageDecl, imports, statements) {
    super('Program')
    this.package = packageDecl
    this.imports = imports
    this.statements = statements
  }
}

class PackageDecl extends ASTNode {
  constructor(name) {
    super('PackageDecl')
    this.name = name
  }
}

class ImportDecl extends ASTNode {
  constructor(path, alias) {
    super('ImportDecl')
    this.path = path
    this.alias = alias
  }
}

class FunctionDecl extends ASTNode {
  constructor(name, params, body) {
    super('FunctionDecl')
    this.name = name
    this.params = params
    this.body = body
  }
}

class VariableDecl extends ASTNode {
  constructor(kind, name, initializer) {
    super('VariableDecl')
    this.kind = kind
    this.name = name
    this.initializer = initializer
  }
}

class ReturnStatement extends ASTNode {
  constructor(value) {
    super('ReturnStatement')
    this.value = value
  }
}

class IfStatement extends ASTNode {
  constructor(condition, thenBlock, elseBlock) {
    super('IfStatement')
    this.condition = condition
    this.thenBlock = thenBlock
    this.elseBlock = elseBlock
  }
}

class ForStatement extends ASTNode {
  constructor(init, condition, update, body) {
    super('ForStatement')
    this.init = init
    this.condition = condition
    this.update = update
    this.body = body
  }
}

class WhileStatement extends ASTNode {
  constructor(condition, body) {
    super('WhileStatement')
    this.condition = condition
    this.body = body
  }
}

class BlockStatement extends ASTNode {
  constructor(statements) {
    super('BlockStatement')
    this.statements = statements
  }
}

class ExpressionStatement extends ASTNode {
  constructor(expression) {
    super('ExpressionStatement')
    this.expression = expression
  }
}

class BinaryExpression extends ASTNode {
  constructor(operator, left, right) {
    super('BinaryExpression')
    this.operator = operator
    this.left = left
    this.right = right
  }
}

class UnaryExpression extends ASTNode {
  constructor(operator, operand) {
    super('UnaryExpression')
    this.operator = operator
    this.operand = operand
  }
}

class CallExpression extends ASTNode {
  constructor(callee, args) {
    super('CallExpression')
    this.callee = callee
    this.args = args
  }
}

class MemberExpression extends ASTNode {
  constructor(object, property, computed = false) {
    super('MemberExpression')
    this.object = object
    this.property = property
    this.computed = computed
  }
}

class OptionalMemberExpression extends ASTNode {
  constructor(object, property) {
    super('OptionalMemberExpression')
    this.object = object
    this.property = property
  }
}

class Identifier extends ASTNode {
  constructor(name) {
    super('Identifier')
    this.name = name
  }
}

class Literal extends ASTNode {
  constructor(value, raw) {
    super('Literal')
    this.value = value
    this.raw = raw
  }
}

class ArrayExpression extends ASTNode {
  constructor(elements) {
    super('ArrayExpression')
    this.elements = elements
  }
}

class ObjectExpression extends ASTNode {
  constructor(properties) {
    super('ObjectExpression')
    this.properties = properties
  }
}

class FunctionExpression extends ASTNode {
  constructor(params, body) {
    super('FunctionExpression')
    this.params = params
    this.body = body
  }
}

class TemplateStringExpression extends ASTNode {
  constructor(parts, expressions) {
    super('TemplateStringExpression')
    this.parts = parts
    this.expressions = expressions
  }
}

class SpreadElement extends ASTNode {
  constructor(argument) {
    super('SpreadElement')
    this.argument = argument
  }
}

class ConditionalExpression extends ASTNode {
  constructor(test, consequent, alternate) {
    super('ConditionalExpression')
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== TokenType.COMMENT && t.type !== TokenType.NEWLINE)
    this.pos = 0
  }
  
  current() {
    return this.tokens[this.pos]
  }
  
  peek(offset = 1) {
    return this.tokens[this.pos + offset]
  }
  
  advance() {
    return this.tokens[this.pos++]
  }
  
  expect(type) {
    const token = this.current()
    if (!token || token.type !== type) {
      throw new Error(`Expected ${type} but got ${token ? token.type : 'EOF'} at line ${token?.line}`)
    }
    return this.advance()
  }
  
  match(...types) {
    const token = this.current()
    return token && types.includes(token.type)
  }
  
  parse() {
    const packageDecl = this.parsePackage()
    const imports = this.parseImports()
    const statements = []
    
    while (this.current() && this.current().type !== TokenType.EOF) {
      statements.push(this.parseStatement())
    }
    
    return new Program(packageDecl, imports, statements)
  }
  
  parsePackage() {
    if (this.match(TokenType.PACKAGE)) {
      this.advance()
      const name = this.expect(TokenType.IDENTIFIER).value
      return new PackageDecl(name)
    }
    return null
  }
  
  parseImports() {
    const imports = []
    while (this.match(TokenType.IMPORT)) {
      this.advance()
      
      let alias = null
      let path = null
      
      if (this.match(TokenType.IDENTIFIER)) {
        alias = this.current().value
        this.advance()
        
        if (this.match(TokenType.IDENTIFIER) && this.current().value === 'from') {
          this.advance()
          path = this.expect(TokenType.STRING).value
        } else {
          throw new Error(`Expected 'from' after import alias at line ${this.current().line}`)
        }
      }
      else if (this.match(TokenType.STRING)) {
        path = this.current().value
        this.advance()
        
        if (this.match(TokenType.IDENTIFIER) && this.current().value === 'as') {
          this.advance()
          alias = this.expect(TokenType.IDENTIFIER).value
        }
      } else {
        throw new Error(`Expected module name or path after 'import' at line ${this.current().line}`)
      }
      
      imports.push(new ImportDecl(path, alias))
    }
    return imports
  }
  
  parseStatement() {
    if (this.match(TokenType.FN)) return this.parseFunctionDecl()
    if (this.match(TokenType.LET, TokenType.CONST)) return this.parseVariableDecl()
    if (this.match(TokenType.RETURN)) return this.parseReturn()
    if (this.match(TokenType.IF)) return this.parseIf()
    if (this.match(TokenType.FOR)) return this.parseFor()
    if (this.match(TokenType.WHILE)) return this.parseWhile()
    if (this.match(TokenType.LBRACE)) return this.parseBlock()
    return this.parseExpressionStatement()
  }
  
  parseFunctionDecl() {
    this.expect(TokenType.FN)
    const name = this.expect(TokenType.IDENTIFIER).value
    this.expect(TokenType.LPAREN)
    const params = []
    while (!this.match(TokenType.RPAREN)) {
      params.push(this.expect(TokenType.IDENTIFIER).value)
      if (this.match(TokenType.COMMA)) this.advance()
    }
    this.expect(TokenType.RPAREN)
    const body = this.parseBlock()
    return new FunctionDecl(name, params, body)
  }
  
  parseVariableDecl() {
    const kind = this.advance().value
    const name = this.expect(TokenType.IDENTIFIER).value
    let initializer = null
    if (this.match(TokenType.ASSIGN)) {
      this.advance()
      initializer = this.parseExpression()
    }
    return new VariableDecl(kind, name, initializer)
  }
  
  parseReturn() {
    this.expect(TokenType.RETURN)
    let value = null
    if (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
      value = this.parseExpression()
    }
    return new ReturnStatement(value)
  }
  
  parseIf() {
    this.expect(TokenType.IF)
    
    const hasParens = this.match(TokenType.LPAREN)
    if (hasParens) this.advance()
    
    const condition = this.parseExpression()
    
    if (hasParens) this.expect(TokenType.RPAREN)
    
    const thenBlock = this.parseBlock()
    let elseBlock = null
    if (this.match(TokenType.ELSE)) {
      this.advance()
      if (this.match(TokenType.IF)) {
        elseBlock = new BlockStatement([this.parseIf()])
      } else {
        elseBlock = this.parseBlock()
      }
    }
    return new IfStatement(condition, thenBlock, elseBlock)
  }
  
  parseFor() {
    this.expect(TokenType.FOR)
    this.expect(TokenType.LPAREN)
    const init = this.match(TokenType.SEMICOLON) ? null : this.parseStatement()
    if (!this.match(TokenType.SEMICOLON)) this.expect(TokenType.SEMICOLON)
    else this.advance()
    const condition = this.match(TokenType.SEMICOLON) ? null : this.parseExpression()
    this.expect(TokenType.SEMICOLON)
    const update = this.match(TokenType.RPAREN) ? null : this.parseExpression()
    this.expect(TokenType.RPAREN)
    const body = this.parseBlock()
    return new ForStatement(init, condition, update, body)
  }
  
  parseWhile() {
    this.expect(TokenType.WHILE)
    
    const hasParens = this.match(TokenType.LPAREN)
    if (hasParens) this.advance()
    
    const condition = this.parseExpression()
    
    if (hasParens) this.expect(TokenType.RPAREN)
    
    const body = this.parseBlock()
    return new WhileStatement(condition, body)
  }
  
  parseBlock() {
    this.expect(TokenType.LBRACE)
    const statements = []
    while (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
      statements.push(this.parseStatement())
    }
    this.expect(TokenType.RBRACE)
    return new BlockStatement(statements)
  }
  
  parseExpressionStatement() {
    const expr = this.parseExpression()
    return new ExpressionStatement(expr)
  }
  
  parseExpression() {
    return this.parseAssignment()
  }
  
  parseAssignment() {
    const expr = this.parseTernary()
    if (this.match(TokenType.ASSIGN)) {
      this.advance()
      const value = this.parseAssignment()
      return new BinaryExpression('=', expr, value)
    }
    return expr
  }
  
  parseTernary() {
    let expr = this.parseNullishCoalescing()
    
    if (this.match(TokenType.QUESTION)) {
      this.advance()
      const consequent = this.parseExpression()
      this.expect(TokenType.COLON)
      const alternate = this.parseTernary()
      return new ConditionalExpression(expr, consequent, alternate)
    }
    
    return expr
  }
  
  parseNullishCoalescing() {
    let left = this.parseLogicalOr()
    while (this.match(TokenType.NULLISH)) {
      const op = '??'
      this.advance()
      const right = this.parseLogicalOr()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }
  
  parseLogicalOr() {
    let left = this.parseLogicalAnd()
    while (this.match(TokenType.OR)) {
      const op = this.advance().value
      const right = this.parseLogicalAnd()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }
  
  parseLogicalAnd() {
    let left = this.parseEquality()
    while (this.match(TokenType.AND)) {
      const op = this.advance().value
      const right = this.parseEquality()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }
  
  parseEquality() {
    let left = this.parseRelational()
    while (this.match(TokenType.EQ, TokenType.NEQ)) {
      const op = this.advance().value
      const right = this.parseRelational()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }
  
  parseRelational() {
    let left = this.parseAdditive()
    while (this.match(TokenType.LT, TokenType.GT, TokenType.LTE, TokenType.GTE)) {
      const op = this.advance().value
      const right = this.parseAdditive()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }
  
  parseAdditive() {
    let left = this.parseMultiplicative()
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const op = this.advance().value
      const right = this.parseMultiplicative()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }
  
  parseMultiplicative() {
    let left = this.parseUnary()
    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const op = this.advance().value
      const right = this.parseUnary()
      left = new BinaryExpression(op, left, right)
    }
    return left
  }
  
  parseUnary() {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const op = this.advance().value
      const operand = this.parseUnary()
      return new UnaryExpression(op, operand)
    }
    return this.parsePostfix()
  }
  
  parsePostfix() {
    let expr = this.parsePrimary()
    
    while (true) {
      if (this.match(TokenType.LPAREN)) {
        this.advance()
        const args = []
        while (!this.match(TokenType.RPAREN)) {
          if (this.match(TokenType.SPREAD)) {
            this.advance()
            const arg = this.parseExpression()
            args.push(new SpreadElement(arg))
          } else {
            args.push(this.parseExpression())
          }
          if (this.match(TokenType.COMMA)) this.advance()
        }
        this.expect(TokenType.RPAREN)
        expr = new CallExpression(expr, args)
      } else if (this.match(TokenType.OPTIONAL_CHAIN)) {
        this.advance()
        const property = this.expect(TokenType.IDENTIFIER).value
        expr = new OptionalMemberExpression(expr, new Identifier(property))
      } else if (this.match(TokenType.DOT)) {
        this.advance()
        const property = this.expect(TokenType.IDENTIFIER).value
        expr = new MemberExpression(expr, new Identifier(property), false)
      } else if (this.match(TokenType.LBRACKET)) {
        this.advance()
        const index = this.parseExpression()
        this.expect(TokenType.RBRACKET)
        expr = new MemberExpression(expr, index, true)
      } else {
        break
      }
    }
    
    return expr
  }
  
  parsePrimary() {
    if (this.match(TokenType.NUMBER)) {
      const token = this.advance()
      return new Literal(token.value, token.value)
    }
    
    if (this.match(TokenType.STRING)) {
      const token = this.advance()
      return new Literal(token.value, `"${token.value}"`)
    }
    
    if (this.match(TokenType.TEMPLATE_STRING)) {
      const token = this.advance()
      return new TemplateStringExpression(token.value.parts, token.value.expressions)
    }
    
    if (this.match(TokenType.TRUE, TokenType.FALSE)) {
      const token = this.advance()
      return new Literal(token.value === 'true', token.value)
    }
    
    if (this.match(TokenType.NULL)) {
      this.advance()
      return new Literal(null, 'null')
    }
    
    if (this.match(TokenType.UNDEFINED)) {
      this.advance()
      return new Literal(undefined, 'undefined')
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      const token = this.advance()
      return new Identifier(token.value)
    }
    
    if (this.match(TokenType.LBRACKET)) {
      this.advance()
      const elements = []
      while (!this.match(TokenType.RBRACKET)) {
        if (this.match(TokenType.SPREAD)) {
          this.advance()
          const arg = this.parseExpression()
          elements.push(new SpreadElement(arg))
        } else {
          elements.push(this.parseExpression())
        }
        if (this.match(TokenType.COMMA)) this.advance()
      }
      this.expect(TokenType.RBRACKET)
      return new ArrayExpression(elements)
    }
    
    if (this.match(TokenType.LBRACE)) {
      this.advance()
      const properties = []
      while (!this.match(TokenType.RBRACE)) {
        if (this.match(TokenType.SPREAD)) {
          this.advance()
          const arg = this.parseExpression()
          properties.push({ type: 'spread', value: arg })
        } else {
          const key = this.expect(TokenType.IDENTIFIER).value
          this.expect(TokenType.COLON)
          const value = this.parseExpression()
          properties.push({ key, value })
        }
        if (this.match(TokenType.COMMA)) this.advance()
      }
      this.expect(TokenType.RBRACE)
      return new ObjectExpression(properties)
    }
    
    if (this.match(TokenType.LPAREN)) {
      this.advance()
      const expr = this.parseExpression()
      this.expect(TokenType.RPAREN)
      return expr
    }
    
    if (this.match(TokenType.FN)) {
      this.advance()
      this.expect(TokenType.LPAREN)
      const params = []
      while (!this.match(TokenType.RPAREN)) {
        params.push(this.expect(TokenType.IDENTIFIER).value)
        if (this.match(TokenType.COMMA)) this.advance()
      }
      this.expect(TokenType.RPAREN)
      const body = this.parseBlock()
      return new FunctionExpression(params, body)
    }
    
    const token = this.current()
    throw new Error(`Unexpected token ${token?.type} at line ${token?.line}`)
  }
}

module.exports = {
  Parser,
  ASTNode,
  Program,
  PackageDecl,
  ImportDecl,
  FunctionDecl,
  VariableDecl,
  ReturnStatement,
  IfStatement,
  ForStatement,
  WhileStatement,
  BlockStatement,
  ExpressionStatement,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  Identifier,
  Literal,
  ArrayExpression,
  ObjectExpression,
  ConditionalExpression,
  SpreadElement
}
