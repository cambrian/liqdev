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
  ) => watch('*.liq') // Recursive glob should work but does not...
    .on('change', (path) => {
      console.log('Compiling changed file ' + path + '.')
      const contractName = path.slice(0, -4)
      compile(contractName, execute, compilerPath)
      // TODO: Capture output and use blessed to clear screen.
    })
}
