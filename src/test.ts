import * as eztz from 'eztz'
import * as fs from 'fs-extra'

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
const testCase = (eztz: EZTZ, contractPath: Path, testCaseData: TestCaseData) => null

const testContract =
  async (
    parentSuite: Mocha.Suite,
    eztz: EZTZ,
    contractPath: Path,
    tests: TestCaseData[],
    generate: boolean
  ) => {
    let suite = new Mocha.Suite(contractPath)
    parentSuite.addSuite(suite)
    for (let test of tests) {
      suite.addTest(new Mocha.Test(test.name, async () => {
        let diff = testCase(eztz, contractPath, test)
        if (diff) throw diff
      }))
    }
  }

export const test = async (
  compile: Compiler,
  eztz: EZTZ,
  contractGlob: Path,
  generate: boolean
) => {
  let suite = new Mocha.Suite('Liqdev Tests')
  let runner = new Mocha.Runner(suite, false)
  let files = await glob(contractGlob)
  for (let file of files) {
    if (!file.endsWith('.liq')) continue
    let testFile = file + '.test.json'
    let hasTestFile = true
    await fs.access(testFile, fs.constants.F_OK).catch(e => { if (e) hasTestFile = false })
    if (!hasTestFile) {
      console.warn('Test file not found for "' + file + '". Skipping...')
      continue
    }
    let validTestFile = true
    let tests = await fs.readJson(testFile).catch(e => { if (e) validTestFile = false }) // TODO: better validation
    if (!validTestFile) {
      console.error('Invalid test file for "' + file + '". Skipping...')
      continue
    }
    compile(file)
    testContract(suite, eztz, file, tests, generate)
  }
  runner.run()
}
