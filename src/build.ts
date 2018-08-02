import { ExecOutputReturnValue } from 'shelljs'
import { FSWatcher, WatchOptions } from 'chokidar'

export namespace Build {
  export const compile = (
    contractName: String,
    execute: (command: String) => ExecOutputReturnValue,
    compilerPath: String = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm',
  ) => execute(compilerPath + ' ' + contractName + '.liq')

  export const startWatcher = (
    watch: (paths: string | string[], options?: WatchOptions) => FSWatcher,
    execute: (command: String) => ExecOutputReturnValue,
    compilerPath: String = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
  ) => watch('*.liq')
    .on('add', (event, path) => console.log(path + ' added'))
    .on('change', (event, path) => console.log(path + ' changed'))
}
