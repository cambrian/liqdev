import * as eztz from 'eztz'
import * as glob from 'glob'

import { Address, Key, Path } from './types'

import { Compiler } from '@src/build'

type EZTZ = typeof eztz

interface Case {
  name: string,
  initStorage: string,
  input: string,
  expectedStorage?: object
}

// TODO: Finish all of these functions.
const deploy = (eztz: EZTZ, accountSK: Key, contractPath: Path): Address => ''
const fund = (eztz: EZTZ, fromSK: Key, toPKH: Address, amount: Number) => null
const call = (eztz: EZTZ, contractAddress: Address, accountSK: Key, parameters: string) => null
const testCase = (eztz: EZTZ, contractPath: Path, caseData: Case) => null
const testContract = (eztz: EZTZ, contractPath: Path, generate: boolean) => null

export const test = (
  compile: Compiler,
  eztz: EZTZ,
  contractGlob: Path,
  generate: boolean
) => glob(contractGlob, (_ /* Add back in and handle. */, matches) => null)
