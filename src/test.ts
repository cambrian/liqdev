import * as eztz from 'eztz'
import * as glob from 'glob'

import { exec } from 'shelljs'

export namespace Test {
  const deploy = (accountSK: String, contractPath: String): String => String()
  const fund = (fromSK: String, toPKH: String, amount: Number) => null
  const call = (contractID: String, accountSK: String, parameters: String) => null

  export const run = (
    directory: String,
    globber: typeof glob,
    execute: typeof exec,
    compilerPath: String,
    tezosClient: typeof eztz
  ) => null
}
