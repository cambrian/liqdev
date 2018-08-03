import * as eztz from 'eztz'
import * as glob from 'glob'
import { Address, Key, Path } from './types'

import { exec } from 'shelljs'

export namespace Test {
  const deploy = (accountSK: Key, contractPath: Path): Address => ''
  const fund = (fromSK: Key, toPKH: Address, amount: Number) => null
  const call = (contractAddress: Address, accountSK: Key, parameters: string) => null

  export const run = (
    directory: Path,
    globber: typeof glob,
    execute: typeof exec,
    compilerPath: Path,
    tezosClient: typeof eztz
  ) => null
}
