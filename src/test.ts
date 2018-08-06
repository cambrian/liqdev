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
const testCase = async (eztz: EZTZ, contractPath: Path, testCaseData: TestCaseData) => null

const testContract =
  async (
    eztz: EZTZ,
    contractPath: Path,
    tests: TestCaseData[],
    generate: boolean
  ) => {
    let suite = new Mocha.Suite(contractPath)
    let runner = new Mocha.Runner(suite, false)
    let _ = new Mocha.reporters.Spec(runner)
    for (let test of tests) {
      suite.addTest(new Mocha.Test(test.name, async () => {
        let diff = testCase(eztz, contractPath, test)
        if (diff) throw new Error('Contract produced different output than expected: ' + diff)
      }))
    }
    runner.run()
  }

const readTestFile = async (file: Path) => {
  let x = {
    exists: true,
    valid: true,
    data: []
  }
  await fs.access(file, fs.constants.F_OK).catch(e => { if (e) x.exists = false })
  x.data = await fs.readJson(file).catch(e => { if (e) x.valid = false })
  // TODO: better validation
  return x
}

export const test = async (
  compile: Compiler,
  eztz: EZTZ,
  contractGlob: Path,
  generate: boolean
) => {
  let files = await glob(contractGlob)
  for (let file of files) {
    if (!file.endsWith('.liq')) continue
    let testFile = file + '.test.json'
    let tests = await readTestFile(testFile)
    if (!tests.exists) {
      console.warn('Test file not found for "' + file + '". Skipping...')
      continue
    }
    if (!tests.valid) {
      console.error('Invalid test file for "' + file + '". Skipping...')
      continue
    }
    compile(file)
    testContract(eztz, file, tests.data, generate)
  }
}
