import { exec } from 'shelljs'
import { watch as watchImport } from 'chokidar'
import { Path } from './types'

export namespace Build {
  export const compile = (
    execute: typeof exec,
    compilerPath: Path,
    contractPath: Path
  ) => execute(compilerPath + ' ' + contractPath)

  export const startWatcher = (
    watch: typeof watchImport,
    execute: typeof exec,
    compilerPath: Path
  ) => watch('**/*.liq', { ignoreInitial: true })
    .on('add', (filePath: Path) => {
      console.log('Compiling new file ' + filePath + '.')
      compile(execute, compilerPath, filePath)
    })
    .on('change', (filePath: Path) => {
      console.log('Compiling changed file ' + filePath + '.')
      compile(execute, compilerPath, filePath)
    })
}
