const TokenType = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  TEMPLATE_STRING: 'TEMPLATE_STRING',
  IDENTIFIER: 'IDENTIFIER',

  PACKAGE: 'PACKAGE',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  FN: 'FN',
  ASYNC: 'ASYNC',
  AWAIT: 'AWAIT',
  RETURN: 'RETURN',
  IF: 'IF',
  ELSE: 'ELSE',
  FOR: 'FOR',
  WHILE: 'WHILE',
  BREAK: 'BREAK',
  CONTINUE: 'CONTINUE',
  LET: 'LET',
  CONST: 'CONST',
  VAR: 'VAR',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NULL: 'NULL',
  UNDEFINED: 'UNDEFINED',
  CLASS: 'CLASS',
  EXTENDS: 'EXTENDS',
  NEW: 'NEW',
  THIS: 'THIS',
  SUPER: 'SUPER',
  STATIC: 'STATIC',
  TRY: 'TRY',
  CATCH: 'CATCH',
  FINALLY: 'FINALLY',
  THROW: 'THROW',
  TYPEOF: 'TYPEOF',
  INSTANCEOF: 'INSTANCEOF',
  IN: 'IN',
  OF: 'OF',
  
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  POWER: 'POWER',
  ASSIGN: 'ASSIGN',
  PLUS_ASSIGN: 'PLUS_ASSIGN',
  MINUS_ASSIGN: 'MINUS_ASSIGN',
  STAR_ASSIGN: 'STAR_ASSIGN',
  SLASH_ASSIGN: 'SLASH_ASSIGN',
  EQ: 'EQ',
  EQ_STRICT: 'EQ_STRICT',
  NEQ: 'NEQ',
  NEQ_STRICT: 'NEQ_STRICT',
  LT: 'LT',
  GT: 'GT',
  LTE: 'LTE',
  GTE: 'GTE',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  BITWISE_AND: 'BITWISE_AND',
  BITWISE_OR: 'BITWISE_OR',
  BITWISE_XOR: 'BITWISE_XOR',
  BITWISE_NOT: 'BITWISE_NOT',
  SHIFT_LEFT: 'SHIFT_LEFT',
  SHIFT_RIGHT: 'SHIFT_RIGHT',
  QUESTION: 'QUESTION',
  NULLISH: 'NULLISH',
  OPTIONAL_CHAIN: 'OPTIONAL_CHAIN',
  SPREAD: 'SPREAD',

  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  COMMA: 'COMMA',
  DOT: 'DOT',
  COLON: 'COLON',
  SEMICOLON: 'SEMICOLON',
  ARROW: 'ARROW',
  FAT_ARROW: 'FAT_ARROW',

  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
  COMMENT: 'COMMENT'
}

const KEYWORDS = {
  'package': TokenType.PACKAGE,
  'import': TokenType.IMPORT,
  'export': TokenType.EXPORT,
  'fn': TokenType.FN,
  'fun': TokenType.FN,
  'async': TokenType.ASYNC,
  'await': TokenType.AWAIT,
  'return': TokenType.RETURN,
  'if': TokenType.IF,
  'else': TokenType.ELSE,
  'for': TokenType.FOR,
  'while': TokenType.WHILE,
  'break': TokenType.BREAK,
  'continue': TokenType.CONTINUE,
  'let': TokenType.LET,
  'const': TokenType.CONST,
  'var': TokenType.VAR,
  'true': TokenType.TRUE,
  'false': TokenType.FALSE,
  'null': TokenType.NULL,
  'undefined': TokenType.UNDEFINED,
  'class': TokenType.CLASS,
  'extends': TokenType.EXTENDS,
  'new': TokenType.NEW,
  'this': TokenType.THIS,
  'super': TokenType.SUPER,
  'static': TokenType.STATIC,
  'try': TokenType.TRY,
  'catch': TokenType.CATCH,
  'finally': TokenType.FINALLY,
  'throw': TokenType.THROW,
  'typeof': TokenType.TYPEOF,
  'instanceof': TokenType.INSTANCEOF,
  'in': TokenType.IN,
  'of': TokenType.OF
}

class Token {
  constructor(type, value, line, col) {
    this.type = type
    this.value = value
    this.line = line
    this.col = col
  }
}

class Lexer {
  constructor(source) {
    this.source = source
    this.pos = 0
    this.line = 1
    this.col = 1
    this.tokens = []
  }
  
  current() {
    return this.source[this.pos]
  }
  
  peek(offset = 1) {
    return this.source[this.pos + offset]
  }
  
  advance() {
    const ch = this.current()
    this.pos++
    if (ch === '\n') {
      this.line++
      this.col = 1
    } else {
      this.col++
    }
    return ch
  }
  
  skipWhitespace() {
    while (this.current() && /[ \t\r]/.test(this.current())) {
      this.advance()
    }
  }
  
  readNumber() {
    const start = this.pos
    const line = this.line
    const col = this.col
    let hasDecimal = false
    
    while (this.current() && (/[0-9]/.test(this.current()) || this.current() === '.')) {
      if (this.current() === '.') {
        if (hasDecimal) break
        hasDecimal = true
      }
      this.advance()
    }
    
    if (this.current() === 'e' || this.current() === 'E') {
      this.advance()
      if (this.current() === '+' || this.current() === '-') {
        this.advance()
      }
      while (this.current() && /[0-9]/.test(this.current())) {
        this.advance()
      }
    }
    
    const value = this.source.slice(start, this.pos)
    return new Token(TokenType.NUMBER, parseFloat(value), line, col)
  }
  
  readString(quote) {
    const line = this.line
    const col = this.col
    this.advance()
    let value = ''
    while (this.current() && this.current() !== quote) {
      if (this.current() === '\\') {
        this.advance()
        const next = this.current()
        if (next === 'n') value += '\n'
        else if (next === 't') value += '\t'
        else if (next === 'r') value += '\r'
        else if (next === '\\') value += '\\'
        else if (next === quote) value += quote
        else value += next
        this.advance()
      } else {
        value += this.advance()
      }
    }
    this.advance()
    return new Token(TokenType.STRING, value, line, col)
  }
  
  readTemplateString() {
    const line = this.line
    const col = this.col
    this.advance()
    let value = ''
    const parts = []
    const expressions = []
    
    while (this.current() && this.current() !== '`') {
      if (this.current() === '$' && this.peek() === '{') {
        if (value) {
          parts.push(value)
          value = ''
        }
        this.advance()
        this.advance()
        
        let expr = ''
        let braceCount = 1
        let bracketCount = 0
        while (this.current() && braceCount > 0) {
          const ch = this.current()
          if (ch === '{') braceCount++
          else if (ch === '}') braceCount--
          else if (ch === '[') bracketCount++
          else if (ch === ']') bracketCount--
          
          if (braceCount > 0) expr += ch
          this.advance()
        }
        expressions.push(expr)
      } else if (this.current() === '\\') {
        this.advance()
        const next = this.current()
        if (next === 'n') value += '\n'
        else if (next === 't') value += '\t'
        else if (next === 'r') value += '\r'
        else if (next === '\\') value += '\\'
        else if (next === '`') value += '`'
        else value += next
        this.advance()
      } else {
        value += this.advance()
      }
    }
    
    if (value) parts.push(value)
    this.advance()
    
    return new Token(TokenType.TEMPLATE_STRING, { parts, expressions }, line, col)
  }
  
  readIdentifier() {
    const start = this.pos
    const line = this.line
    const col = this.col
    while (this.current() && /[a-zA-Z0-9_$]/.test(this.current())) {
      this.advance()
    }
    const value = this.source.slice(start, this.pos)
    const type = KEYWORDS[value] || TokenType.IDENTIFIER
    return new Token(type, value, line, col)
  }
  
  readComment() {
    const line = this.line
    const col = this.col
    this.advance()
    this.advance()
    let value = ''
    while (this.current() && this.current() !== '\n') {
      value += this.advance()
    }
    return new Token(TokenType.COMMENT, value.trim(), line, col)
  }
  
  readBlockComment() {
    const line = this.line
    const col = this.col
    this.advance()
    this.advance()
    let value = ''
    while (this.current()) {
      if (this.current() === '*' && this.peek() === '/') {
        this.advance()
        this.advance()
        break
      }
      value += this.advance()
    }
    return new Token(TokenType.COMMENT, value.trim(), line, col)
  }
  
  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace()
      
      if (!this.current()) break
      
      const ch = this.current()
      const line = this.line
      const col = this.col
      
      if (ch === '\n') {
        this.tokens.push(new Token(TokenType.NEWLINE, '\\n', line, col))
        this.advance()
        continue
      }
      
      if (ch === '/' && this.peek() === '/') {
        this.tokens.push(this.readComment())
        continue
      }
      
      if (ch === '/' && this.peek() === '*') {
        this.tokens.push(this.readBlockComment())
        continue
      }
      
      if (/[0-9]/.test(ch)) {
        this.tokens.push(this.readNumber())
        continue
      }
      
      if (ch === '`') {
        this.tokens.push(this.readTemplateString())
        continue
      }
      
      if (ch === '"' || ch === "'") {
        this.tokens.push(this.readString(ch))
        continue
      }
      
      if (/[a-zA-Z_$]/.test(ch)) {
        this.tokens.push(this.readIdentifier())
        continue
      }
      
      if (ch === '=' && this.peek() === '=' && this.peek(2) === '=') {
        this.advance(); this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.EQ_STRICT, '===', line, col))
        continue
      }
      
      if (ch === '!' && this.peek() === '=' && this.peek(2) === '=') {
        this.advance(); this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.NEQ_STRICT, '!==', line, col))
        continue
      }
      
      if (ch === '.' && this.peek() === '.' && this.peek(2) === '.') {
        this.advance(); this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.SPREAD, '...', line, col))
        continue
      }
      
      if (ch === '<' && this.peek() === '<') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.SHIFT_LEFT, '<<', line, col))
        continue
      }
      
      if (ch === '>' && this.peek() === '>') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.SHIFT_RIGHT, '>>', line, col))
        continue
      }
      
      if (ch === '=' && this.peek() === '>') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.ARROW, '=>', line, col))
        continue
      }
      
      if (ch === '-' && this.peek() === '>') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.FAT_ARROW, '->', line, col))
        continue
      }
      
      if (ch === '?' && this.peek() === '?') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.NULLISH, '??', line, col))
        continue
      }
      
      if (ch === '?' && this.peek() === '.') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.OPTIONAL_CHAIN, '?.', line, col))
        continue
      }
      
      if (ch === '*' && this.peek() === '*') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.POWER, '**', line, col))
        continue
      }
      
      if (ch === '+' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.PLUS_ASSIGN, '+=', line, col))
        continue
      }
      
      if (ch === '-' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.MINUS_ASSIGN, '-=', line, col))
        continue
      }
      
      if (ch === '*' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.STAR_ASSIGN, '*=', line, col))
        continue
      }
      
      if (ch === '/' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.SLASH_ASSIGN, '/=', line, col))
        continue
      }
      
      if (ch === '=' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.EQ, '==', line, col))
        continue
      }
      
      if (ch === '!' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.NEQ, '!=', line, col))
        continue
      }
      
      if (ch === '<' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.LTE, '<=', line, col))
        continue
      }
      
      if (ch === '>' && this.peek() === '=') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.GTE, '>=', line, col))
        continue
      }
      
      if (ch === '&' && this.peek() === '&') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.AND, '&&', line, col))
        continue
      }
      
      if (ch === '|' && this.peek() === '|') {
        this.advance(); this.advance()
        this.tokens.push(new Token(TokenType.OR, '||', line, col))
        continue
      }
      
      if (ch === '+') { this.tokens.push(new Token(TokenType.PLUS, '+', line, col)); this.advance(); continue }
      if (ch === '-') { this.tokens.push(new Token(TokenType.MINUS, '-', line, col)); this.advance(); continue }
      if (ch === '*') { this.tokens.push(new Token(TokenType.STAR, '*', line, col)); this.advance(); continue }
      if (ch === '/') { this.tokens.push(new Token(TokenType.SLASH, '/', line, col)); this.advance(); continue }
      if (ch === '%') { this.tokens.push(new Token(TokenType.PERCENT, '%', line, col)); this.advance(); continue }
      if (ch === '=') { this.tokens.push(new Token(TokenType.ASSIGN, '=', line, col)); this.advance(); continue }
      if (ch === '!') { this.tokens.push(new Token(TokenType.NOT, '!', line, col)); this.advance(); continue }
      if (ch === '<') { this.tokens.push(new Token(TokenType.LT, '<', line, col)); this.advance(); continue }
      if (ch === '>') { this.tokens.push(new Token(TokenType.GT, '>', line, col)); this.advance(); continue }
      if (ch === '&') { this.tokens.push(new Token(TokenType.BITWISE_AND, '&', line, col)); this.advance(); continue }
      if (ch === '|') { this.tokens.push(new Token(TokenType.BITWISE_OR, '|', line, col)); this.advance(); continue }
      if (ch === '^') { this.tokens.push(new Token(TokenType.BITWISE_XOR, '^', line, col)); this.advance(); continue }
      if (ch === '~') { this.tokens.push(new Token(TokenType.BITWISE_NOT, '~', line, col)); this.advance(); continue }
      if (ch === '?') { this.tokens.push(new Token(TokenType.QUESTION, '?', line, col)); this.advance(); continue }
      
      if (ch === '(') { this.tokens.push(new Token(TokenType.LPAREN, '(', line, col)); this.advance(); continue }
      if (ch === ')') { this.tokens.push(new Token(TokenType.RPAREN, ')', line, col)); this.advance(); continue }
      if (ch === '{') { this.tokens.push(new Token(TokenType.LBRACE, '{', line, col)); this.advance(); continue }
      if (ch === '}') { this.tokens.push(new Token(TokenType.RBRACE, '}', line, col)); this.advance(); continue }
      if (ch === '[') { this.tokens.push(new Token(TokenType.LBRACKET, '[', line, col)); this.advance(); continue }
      if (ch === ']') { this.tokens.push(new Token(TokenType.RBRACKET, ']', line, col)); this.advance(); continue }
      if (ch === ',') { this.tokens.push(new Token(TokenType.COMMA, ',', line, col)); this.advance(); continue }
      if (ch === '.') { this.tokens.push(new Token(TokenType.DOT, '.', line, col)); this.advance(); continue }
      if (ch === ':') { this.tokens.push(new Token(TokenType.COLON, ':', line, col)); this.advance(); continue }
      if (ch === ';') { this.tokens.push(new Token(TokenType.SEMICOLON, ';', line, col)); this.advance(); continue }
      
      throw new Error(`Unexpected character '${ch}' at line ${line}, col ${col}`)
    }
    
    this.tokens.push(new Token(TokenType.EOF, null, this.line, this.col))
    return this.tokens
  }
}

module.exports = { Lexer, TokenType, Token }
