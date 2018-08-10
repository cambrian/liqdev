import * as path from 'path'

import { Compiler, Path } from './types'

import { exec } from 'shelljs'
import { watch } from 'chokidar'

export function createCompiler (compilerPath: Path): Compiler {
  return ((contractPath: Path) => exec(compilerPath + ' ' + contractPath)) as Compiler
}

export function startWatcher (compile: Compiler, glob = '**/*.liq') {
  return watch(glob)
    // For some reason the initial add isn't filtered at all. But we want to filter anyway bc the
    // user could have globbed some weird stuff
    .on('add', (file: Path) => {
      if (path.extname(file) !== '.liq') return
      console.log('Compiling new file ' + file + '.')
      compile(file)
    })
    .on('change', (file: Path) => {
      if (path.extname(file) !== '.liq') return
      console.log('Compiling changed file ' + file + '.')
      compile(file)
    })
}
