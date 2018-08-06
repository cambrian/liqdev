import * as Mocha from 'mocha'
import * as glob from 'glob-promise'

import { Address, EZTZ, Key, Path, TestCaseData } from './types'

import { Compiler } from '@src/build'

// TODO: Finish all of these functions.
const deploy = (eztz: EZTZ, accountSK: Key, contractPath: Path): Address => ''

// const fund = (eztz: EZTZ, fromSK: Key, toPKH: Address, amount: Number) => null
const call = (eztz: EZTZ, contractAddress: Address, accountSK: Key, parameters: string) => null
const testCase = (mocha: Mocha, eztz: EZTZ, contractPath: Path, testCaseData: TestCaseData) => null
const testContract = (mocha: Mocha, eztz: EZTZ, contractPath: Path, generate: boolean) => null

export async function test (
  compile: Compiler,
  eztz: EZTZ,
  contractGlob: Path,
  generate: boolean
) {
  let mocha = new Mocha()
  let files = await glob(contractGlob)
  for (let file of files) {
    testContract(mocha, eztz, file, generate)
  }
  // mocha.run(...todo)
}
