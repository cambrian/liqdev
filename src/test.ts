import 'mocha'

import * as eztz from 'eztz'

import { Address, Key, Path } from './types'

import { Compiler } from '@src/build'

import glob = require('glob-promise')

import Mocha = require('mocha')

type EZTZ = typeof eztz

interface TestCaseData {
  name: string,
  initStorage: string,
  input: string,
  expectedStorage?: object
}

// TODO: Finish all of these functions.
const deploy = (eztz: EZTZ, accountSK: Key, contractPath: Path): Address => ''
const fund = (eztz: EZTZ, fromSK: Key, toPKH: Address, amount: Number) => null
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
  mocha.run(...todo)
}
