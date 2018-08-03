import { FSWatcher, WatchOptions } from 'chokidar'

import { exec } from 'shelljs'

export namespace Build {
  export const compile = (
    execute: typeof exec,
    compilerPath: String,
    contractPath: String
  ) => execute(compilerPath + ' ' + contractPath)

  export const startWatcher = (
    watch: (paths: string | string[], options?: WatchOptions) => FSWatcher,
    execute: typeof exec,
    compilerPath: String = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
  ) => watch('**/*.liq', { ignoreInitial: true })
    .on('add', (filePath: String) => {
      console.log('Compiling new file ' + filePath + '.')
      compile(execute, compilerPath, filePath)
    })
    .on('change', (filePath: String) => {
      console.log('Compiling changed file ' + filePath + '.')
      compile(execute, compilerPath, filePath)
    })
}
