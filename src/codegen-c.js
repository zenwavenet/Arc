class CCodeGenerator {
  constructor(ast, opts = {}) {
    this.ast = ast
    this.opts = opts
    this.indent = 0
    this.stringLiterals = []
    this.functions = []
  }
  
  generate() {
    let code = this.generateHeader()
    code += this.generateStdlib()
    code += this.generateProgram()
    code += this.generateMain()
    return code
  }
  
  generateHeader() {
    return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <math.h>

typedef enum {
  ARC_NULL,
  ARC_BOOL,
  ARC_NUMBER,
  ARC_STRING,
  ARC_ARRAY,
  ARC_OBJECT,
  ARC_FUNCTION
} ArcValueType;

typedef struct ArcValue {
  ArcValueType type;
  union {
    bool boolean;
    double number;
    char* string;
    void* pointer;
  } data;
} ArcValue;

ArcValue arc_number(double n) {
  ArcValue v;
  v.type = ARC_NUMBER;
  v.data.number = n;
  return v;
}

ArcValue arc_string(const char* s) {
  ArcValue v;
  v.type = ARC_STRING;
  v.data.string = strdup(s);
  return v;
}

ArcValue arc_bool(bool b) {
  ArcValue v;
  v.type = ARC_BOOL;
  v.data.boolean = b;
  return v;
}

ArcValue arc_null() {
  ArcValue v;
  v.type = ARC_NULL;
  return v;
}

void arc_print(ArcValue v) {
  switch(v.type) {
    case ARC_NUMBER:
      printf("%g", v.data.number);
      break;
    case ARC_STRING:
      printf("%s", v.data.string);
      break;
    case ARC_BOOL:
      printf("%s", v.data.boolean ? "true" : "false");
      break;
    case ARC_NULL:
      printf("null");
      break;
    default:
      printf("[object]");
  }
}

void arc_println(ArcValue v) {
  arc_print(v);
  printf("\\n");
}

ArcValue arc_add(ArcValue a, ArcValue b) {
  if (a.type == ARC_NUMBER && b.type == ARC_NUMBER) {
    return arc_number(a.data.number + b.data.number);
  }
  if (a.type == ARC_STRING || b.type == ARC_STRING) {
    char* result = malloc(1000);
    sprintf(result, "%s%s", 
      a.type == ARC_STRING ? a.data.string : "",
      b.type == ARC_STRING ? b.data.string : "");
    return arc_string(result);
  }
  return arc_null();
}

ArcValue arc_sub(ArcValue a, ArcValue b) {
  return arc_number(a.data.number - b.data.number);
}

ArcValue arc_mul(ArcValue a, ArcValue b) {
  return arc_number(a.data.number * b.data.number);
}

ArcValue arc_div(ArcValue a, ArcValue b) {
  return arc_number(a.data.number / b.data.number);
}

ArcValue arc_mod(ArcValue a, ArcValue b) {
  return arc_number(fmod(a.data.number, b.data.number));
}

bool arc_eq(ArcValue a, ArcValue b) {
  if (a.type != b.type) return false;
  switch(a.type) {
    case ARC_NUMBER: return a.data.number == b.data.number;
    case ARC_BOOL: return a.data.boolean == b.data.boolean;
    case ARC_STRING: return strcmp(a.data.string, b.data.string) == 0;
    case ARC_NULL: return true;
    default: return false;
  }
}

bool arc_lt(ArcValue a, ArcValue b) {
  return a.data.number < b.data.number;
}

bool arc_gt(ArcValue a, ArcValue b) {
  return a.data.number > b.data.number;
}

bool arc_lte(ArcValue a, ArcValue b) {
  return a.data.number <= b.data.number;
}

bool arc_gte(ArcValue a, ArcValue b) {
  return a.data.number >= b.data.number;
}

`
  }
  
  generateStdlib() {
    return `
void println_impl(const char* format, ...) {
  printf("%s\\n", format);
}

`
  }
  
  generateProgram() {
    let code = '\n// User code\n\n'
    
    for (const stmt of this.ast.statements) {
      code += this.generateStatement(stmt, 0)
    }
    
    return code
  }
  
  generateMain() {
    return `
int main(int argc, char** argv) {
  #ifdef ARC_HAS_MAIN
  arc_main();
  #endif
  return 0;
}
`
  }
  
  generateStatement(stmt, indent) {
    const ind = '  '.repeat(indent)
    
    switch (stmt.type) {
      case 'FunctionDecl':
        return this.generateFunctionDecl(stmt, indent)
      case 'VariableDecl':
        return ind + this.generateVariableDecl(stmt) + ';\n'
      case 'ReturnStatement':
        return ind + `return ${this.generateExpression(stmt.value)};\n`
      case 'IfStatement':
        return this.generateIf(stmt, indent)
      case 'WhileStatement':
        return this.generateWhile(stmt, indent)
      case 'ForStatement':
        return this.generateFor(stmt, indent)
      case 'ExpressionStatement':
        return ind + this.generateExpression(stmt.expression) + ';\n'
      default:
        return ind + `${stmt.type}\n`
    }
  }
  
  generateFunctionDecl(stmt, indent) {
    const ind = '  '.repeat(indent)
    const params = stmt.params.map(p => `ArcValue ${p}`).join(', ')
    let code = `${ind}ArcValue ${stmt.name}(${params}) {\n`
    
    if (stmt.name === 'main') {
      code = `#define ARC_HAS_MAIN\n${ind}void arc_main() {\n`
    }
    
    for (const s of stmt.body.statements) {
      code += this.generateStatement(s, indent + 1)
    }
    
    code += `${ind}}\n\n`
    return code
  }
  
  generateVariableDecl(stmt) {
    const init = stmt.initializer ? ` = ${this.generateExpression(stmt.initializer)}` : ''
    return `ArcValue ${stmt.name}${init}`
  }
  
  generateIf(stmt, indent) {
    const ind = '  '.repeat(indent)
    let code = `${ind}if (${this.generateCondition(stmt.condition)}) {\n`
    
    for (const s of stmt.thenBlock.statements) {
      code += this.generateStatement(s, indent + 1)
    }
    
    code += `${ind}}`
    
    if (stmt.elseBlock) {
      code += ` else {\n`
      for (const s of stmt.elseBlock.statements) {
        code += this.generateStatement(s, indent + 1)
      }
      code += `${ind}}`
    }
    
    code += '\n'
    return code
  }
  
  generateWhile(stmt, indent) {
    const ind = '  '.repeat(indent)
    let code = `${ind}while (${this.generateCondition(stmt.condition)}) {\n`
    
    for (const s of stmt.body.statements) {
      code += this.generateStatement(s, indent + 1)
    }
    
    code += `${ind}}\n`
    return code
  }
  
  generateFor(stmt, indent) {
    const ind = '  '.repeat(indent)
    const init = stmt.init ? this.generateStatement(stmt.init, 0).trim() : ''
    const cond = stmt.condition ? this.generateCondition(stmt.condition) : 'true'
    const update = stmt.update ? this.generateExpression(stmt.update) : ''
    
    let code = `${ind}for (${init}; ${cond}; ${update}) {\n`
    
    for (const s of stmt.body.statements) {
      code += this.generateStatement(s, indent + 1)
    }
    
    code += `${ind}}\n`
    return code
  }
  
  generateCondition(expr) {
    const e = this.generateExpression(expr)
    return `(${e}.type == ARC_BOOL ? ${e}.data.boolean : ${e}.data.number != 0)`
  }
  
  generateExpression(expr) {
    if (!expr) return 'arc_null()'
    
    switch (expr.type) {
      case 'BinaryExpression':
        return this.generateBinary(expr)
      case 'UnaryExpression':
        return this.generateUnary(expr)
      case 'CallExpression':
        return this.generateCall(expr)
      case 'Identifier':
        return expr.name
      case 'Literal':
        return this.generateLiteral(expr)
      case 'MemberExpression':
        return `/* member access */ arc_null()`
      default:
        return 'arc_null()'
    }
  }
  
  generateBinary(expr) {
    const left = this.generateExpression(expr.left)
    const right = this.generateExpression(expr.right)
    
    switch (expr.operator) {
      case '+': return `arc_add(${left}, ${right})`
      case '-': return `arc_sub(${left}, ${right})`
      case '*': return `arc_mul(${left}, ${right})`
      case '/': return `arc_div(${left}, ${right})`
      case '%': return `arc_mod(${left}, ${right})`
      case '==': return `arc_bool(arc_eq(${left}, ${right}))`
      case '!=': return `arc_bool(!arc_eq(${left}, ${right}))`
      case '<': return `arc_bool(arc_lt(${left}, ${right}))`
      case '>': return `arc_bool(arc_gt(${left}, ${right}))`
      case '<=': return `arc_bool(arc_lte(${left}, ${right}))`
      case '>=': return `arc_bool(arc_gte(${left}, ${right}))`
      case '=': return `(${left} = ${right})`
      default: return `arc_null()`
    }
  }
  
  generateUnary(expr) {
    const operand = this.generateExpression(expr.operand)
    
    switch (expr.operator) {
      case '-': return `arc_number(-(${operand}).data.number)`
      case '!': return `arc_bool(!(${operand}).data.boolean)`
      default: return operand
    }
  }
  
  generateCall(expr) {
    const callee = this.generateExpression(expr.callee)
    const args = expr.args.map(a => this.generateExpression(a)).join(', ')
    
    if (expr.callee.type === 'Identifier') {
      if (expr.callee.name === 'println') {
        return `arc_println(${args})`
      }
      if (expr.callee.name === 'print') {
        return `arc_print(${args})`
      }
    }
    
    return `${callee}(${args})`
  }
  
  generateLiteral(expr) {
    if (typeof expr.value === 'number') {
      return `arc_number(${expr.value})`
    }
    if (typeof expr.value === 'string') {
      return `arc_string("${expr.value.replace(/"/g, '\\"')}")`
    }
    if (typeof expr.value === 'boolean') {
      return `arc_bool(${expr.value})`
    }
    if (expr.value === null) {
      return 'arc_null()'
    }
    return 'arc_null()'
  }
}

module.exports = { CCodeGenerator }
