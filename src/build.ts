import { FSWatcher, WatchOptions } from 'chokidar'

import { ExecOutputReturnValue } from 'shelljs'

export namespace Build {
  export const compile = (
    contractName: String,
    execute: (command: string) => ExecOutputReturnValue,
    compilerPath: String = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
  ) => execute(compilerPath + ' ' + contractName + '.liq')

  export const startWatcher = (
    watch: (paths: string | string[], options?: WatchOptions) => FSWatcher,
    execute: (command: string) => ExecOutputReturnValue,
    compilerPath: String = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
  ) => watch('**/*.liq', { ignoreInitial: true })
    .on('add', (filePath: String) => {
      console.log('Compiling new file ' + filePath + '.')
      const contractName = filePath.slice(0, -4)
      compile(contractName, execute, compilerPath)
    })
    .on('change', (filePath: String) => {
      console.log('Compiling changed file ' + filePath + '.')
      const contractName = filePath.slice(0, -4)
      compile(contractName, execute, compilerPath)
    })
}
