import { Compiler, Path } from './types'

import { exec } from 'shelljs'
import { watch } from 'chokidar'

export const createCompiler = (compilerPath: Path): Compiler =>
  (contractPath: Path) => exec(compilerPath + ' ' + contractPath)

export const startWatcher = (compile: Compiler) =>
  watch('**/*.liq', { ignoreInitial: true })
    .on('add', (filePath: Path) => {
      console.log('Compiling new file ' + filePath + '.')
      compile(filePath)
    })
    .on('change', (filePath: Path) => {
      console.log('Compiling changed file ' + filePath + '.')
      compile(filePath)
    })
