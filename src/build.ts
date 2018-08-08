import { Compiler, Path } from './types'

import { exec } from 'shelljs'
import { watch } from 'chokidar'

export function createCompiler (compilerPath: Path): Compiler {
  return (contractPath: Path) => exec(compilerPath + ' ' + contractPath)
}

export function startWatcher (compile: Compiler) {
  return watch('**/*.liq', { ignoreInitial: true })
    .on('add', (filePath: Path) => {
      console.log('Compiling new file ' + filePath + '.')
      compile(filePath)
    })
    .on('change', (filePath: Path) => {
      console.log('Compiling changed file ' + filePath + '.')
      compile(filePath)
    })
}
