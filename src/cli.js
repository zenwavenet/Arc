#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { compileArcToJS } = require('./compiler')

const pkg = {version: "1.0.0-beta"}

function printHelp() {
  console.log('Arc Programming Language v' + pkg.version)
  console.log('Usage: arc <command> [args]\n')
  console.log('Commands:')
  console.log('  run <file.arc>          Compile and run an .arc file')
  console.log('  build <file.arc>        Compile to JavaScript file (file.js)')
  console.log('  compile <file.arc>      Compile to native C executable')
  console.log('  init <project-name>     Create new Arc project with structure')
  console.log('  version                 Print version')
  console.log('  help                    Show this help')
}

function cmdRun(file) {
  if (!file) {
    console.error('Error: No input file specified')
    printHelp()
    process.exit(1)
  }
  
  if (!fs.existsSync(file)) {
    console.error(`Error: File '${file}' not found`)
    process.exit(1)
  }
  
  try {
    const input = fs.readFileSync(file, 'utf8')
    const js = compileArcToJS(input, { filename: path.resolve(file) })
    
    const cacheDir = path.join(__dirname, '..', '.arc_cache')
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }
    
    const tmp = path.join(cacheDir, `run_${Date.now()}.js`)
    fs.writeFileSync(tmp, js, 'utf8')
    
    const result = spawnSync('node', [tmp], {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    if (fs.existsSync(tmp)) {
      fs.unlinkSync(tmp)
    }
    
    if (result.error) {
      throw result.error
    }
    
    process.exit(result.status || 0)
  } catch (err) {
    console.error('Compilation error:', err.message)
    process.exit(1)
  }
}

function cmdBuild(file) {
  if (!file) {
    console.error('Error: No input file specified')
    printHelp()
    process.exit(1)
  }
  
  if (!fs.existsSync(file)) {
    console.error(`Error: File '${file}' not found`)
    process.exit(1)
  }
  
  try {
    const input = fs.readFileSync(file, 'utf8')
    const js = compileArcToJS(input, { filename: path.resolve(file) })
    const out = file.replace(/\.arc$/, '.js')
    fs.writeFileSync(out, js, 'utf8')
    console.log(`✓ Built: ${file} -> ${out}`)
  } catch (err) {
    console.error('Compilation error:', err.message)
    process.exit(1)
  }
}

function cmdCompile(file) {
  if (!file) {
    console.error('Error: No input file specified')
    printHelp()
    process.exit(1)
  }
  
  if (!fs.existsSync(file)) {
    console.error(`Error: File '${file}' not found`)
    process.exit(1)
  }
  
  try {
    const { Lexer } = require('./lexer')
    const { Parser } = require('./parser')
    const { CCodeGenerator } = require('./codegen-c')
    
    console.log(`Compiling ${file} to native code...`)
    
    const input = fs.readFileSync(file, 'utf8')
    const lexer = new Lexer(input)
    const tokens = lexer.tokenize()
    const parser = new Parser(tokens)
    const ast = parser.parse()
    
    const generator = new CCodeGenerator(ast)
    const cCode = generator.generate()
    
    const cFile = file.replace(/\.arc$/, '.c')
    const exeFile = file.replace(/\.arc$/, '')
    
    fs.writeFileSync(cFile, cCode, 'utf8')
    console.log(`✓ Generated C code: ${cFile}`)
    
    console.log('Compiling C code with gcc...')
    const result = spawnSync('gcc', ['-o', exeFile, cFile, '-lm'], {
      stdio: 'inherit'
    })
    
    if (result.error) {
      if (result.error.code === 'ENOENT') {
        console.error('Error: gcc not found. Please install GCC compiler.')
        console.log('Generated C file:', cFile)
        console.log('You can compile manually with: gcc -o', exeFile, cFile, '-lm')
      } else {
        throw result.error
      }
    } else if (result.status === 0) {
      console.log(`✓ Compiled to native executable: ${exeFile}`)
      console.log(`Run with: ./${path.basename(exeFile)}`)
    } else {
      console.error('GCC compilation failed')
      process.exit(result.status)
    }
  } catch (err) {
    console.error('Compilation error:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

function cmdInit(projectName) {
  if (!projectName) {
    console.error('Error: Project name required')
    console.log('Usage: arc init <project-name>')
    process.exit(1)
  }
  
  const projectDir = path.resolve(projectName)
  
  if (fs.existsSync(projectDir)) {
    console.error(`Error: Directory '${projectName}' already exists`)
    process.exit(1)
  }
  
  console.log(`Creating Arc project: ${projectName}`)
  
  fs.mkdirSync(projectDir, { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'src'))
  fs.mkdirSync(path.join(projectDir, 'tests'))
  
  const packageArc = `package ${projectName}

name: "${projectName}"
version: "${pkg.version}"
description: "Arc project created with arc init"
`
  fs.writeFileSync(path.join(projectDir, 'package.arc'), packageArc)
  
  const mainArc = `package main

import "fmt"

fn main() {
  fmt.println("Welcome to ${projectName}!")
  fmt.println("Your Arc application is running!")

  let x = 10
  let y = 20
  let sum = x + y
  fmt.println("Sum: " + sum)
  
  if (sum > 25) {
    fmt.println("Sum is greater than 25")
  } else {
    fmt.println("Sum is 25 or less")
  }
  
  let i = 0
  while (i < 3) {
    fmt.println("Loop iteration: " + i)
    i = i + 1
  }
  
  fmt.println("Project ${projectName} initialized successfully!")
}

main()
`
  fs.writeFileSync(path.join(projectDir, 'src', 'main.arc'), mainArc)
  
  const readme = `# ${projectName}

Arc project created with \`arc init\`.

## Getting Started

\`\`\`bash
# Run the application
arc run src/main.arc
\`\`\`
`
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme)
  
  const gitignore = `# Arc temp files
.arc_tmp_*.js
*.js
!tests/*.js

# Dependencies
node_modules/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
`
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore)

  const testArc = `package main

import "fmt"

fn testAdd() {
  let result = add(2, 3)
  if (result == 5) {
    fmt.println("testAdd passed")
  } else {
    fmt.println("testAdd failed")
  }
}

fn add(a, b) {
  return a + b
}

fn main() {
  fmt.println("Running tests...")
  testAdd()
  fmt.println("Tests complete!")
}

main()
`
  fs.writeFileSync(path.join(projectDir, 'tests', 'test.arc'), testArc)
  
  console.log(`✓ Created project structure:`)
  console.log(`  ${projectName}/`)
  console.log(`  ├── src/`)
  console.log(`  │   └── main.arc`)
  console.log(`  ├── tests/`)
  console.log(`  │   └── test.arc`)
  console.log(`  ├── package.arc`)
  console.log(`  ├── README.md`)
  console.log(`  └── .gitignore`)
  console.log(`\nNext steps:`)
  console.log(`  cd ${projectName}`)
  console.log(`  arc run src/main.arc`)
}

function cmdVersion() {
  console.log(`Arc v${pkg.version}`)
}

function main() {
  const args = process.argv.slice(2)
  const cmd = args[0]
  
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp()
    process.exit(0)
  }
  
  switch (cmd) {
    case 'run':
      cmdRun(args[1])
      break
    case 'build':
      cmdBuild(args[1])
      break
    case 'build':
      cmdBuild(args[1])
      break
    case 'compile':
      cmdCompile(args[1])
      break
    case 'init':
      cmdInit(args[1])
      break
    case 'version':
      cmdVersion()
      break
    default:
      console.error(`Error: Unknown command '${cmd}'`)
      printHelp()
      process.exit(1)
  }
}

main()

module.exports = { main }
