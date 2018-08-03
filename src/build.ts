import { exec } from 'shelljs'
import { watch as watchImport } from 'chokidar'

export namespace Build {
  export const compileSync = (
    execute: typeof exec,
    compilerPath: string,
    contractPath: string
  ) => execute(compilerPath + ' ' + contractPath)

  export const startWatcher = (
    watch: typeof watchImport,
    execute: typeof exec,
    compilerPath: string
  ) => watch('**/*.liq', { ignoreInitial: true })
    .on('add', (filePath: string) => {
      console.log('Compiling new file ' + filePath + '.')
      compileSync(execute, compilerPath, filePath)
    })
    .on('change', (filePath: string) => {
      console.log('Compiling changed file ' + filePath + '.')
      compileSync(execute, compilerPath, filePath)
    })
}
