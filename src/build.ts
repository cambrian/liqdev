import * as path from 'path'

import { Compiler, Path } from './types'
import { FSWatcher, watch } from 'chokidar'

import { exec } from 'shelljs'

export function createCompiler (compilerPath: Path): Compiler {
  return ((contractPath: Path) => exec(compilerPath + ' ' + contractPath)) as Compiler
}

export function startWatcher (compile: Compiler, glob: string = '**/*.liq'): FSWatcher {
  return watch(glob)
    // For some reason the initial add isn't filtered at all. But we want to filter anyway
    // because the user could have globbed some weird stuff.
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
