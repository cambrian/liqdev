import * as eztz from 'eztz'
import * as glob from 'glob'
import { Address, Key, Path } from './types'

import { Build } from '@src/build'
import { exec } from 'shelljs'

export namespace Test {
  const deploy = (accountSK: Key, contractPath: Path): Address => ''
  const fund = (fromSK: Key, toPKH: Address, amount: Number) => null
  const call = (contractAddress: Address, accountSK: Key, parameters: string) => null

  const runTest =

  export const run = (
    directory: Path,
    globber: typeof glob,
    tezosClient: typeof eztz,
    builder: typeof Build,
    execute: typeof exec,
    compilerPath: Path
  ) => globber('**/*.liq', (error, matches) => {
    if (error) {
      console.error('Glob error occurred.')
      process.exit(1)
    }

    matches.forEach(match => builder.compileSync(exec, compilerPath, match))
    matches.forEach(match => )
  })
}
