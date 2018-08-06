import 'colors'

import * as eztz from 'eztz'
import * as fs from 'fs-extra'
import * as readline from 'readline'

import { Address, Key, Path } from './types'
import { diffJson, diffWords } from 'diff'
import { exec, execSync } from 'child_process'

import { Compiler } from '@src/build'

import glob = require('glob-promise')

import Mocha = require('mocha')

type EZTZ = typeof eztz

interface TestCaseData {
  name: string,
  initStorage: string,
  input: string,
  expectedStorage: object
}

// TODO: Finish all of these functions.
const deploy = (eztz: EZTZ, accountSK: Key, contractPath: Path): Address => ''
const fund = (eztz: EZTZ, fromSK: Key, toPKH: Address, amount: Number) => null
const call = (eztz: EZTZ, contractAddress: Address, accountSK: Key, parameters: string) => null
const runCase = async (eztz: EZTZ, contractPath: Path, testCaseData: TestCaseData) => Object() // return new storage

const prettyJson = (obj: any) => JSON.stringify(obj, null, 2)

const diff = (a: string, b: string) =>
  new Promise<string>((resolve, _) =>
    // can't use execSync here because sdiff reports failure when it finds a diff
    exec('bash -c "diff -y <(echo \'' + a + '\') <(echo \'' + b + '\')"', (_err, stdout, _stderr) => {
      resolve(stdout)
    })
  )

const testContract = async (
  eztz: EZTZ,
  contractPath: Path,
  tests: TestCaseData[]
) => {
  let suite = new Mocha.Suite(contractPath)
  let runner = new Mocha.Runner(suite, false)
  // runner is never called explicitly but necessary to create
  let _ = new Mocha.reporters.Spec(runner)

  for (let test of tests) {
    let newStorage = await runCase(eztz, contractPath, test)
    let d = await diff(prettyJson(test.expectedStorage), prettyJson(newStorage))
    suite.addTest(new Mocha.Test(test.name, async () => {
      if (d !== '') {
        throw new Error('Contract produced nonzero diff with expected storage (left):\n' + d
        )
      }
    }))
  }
  runner.run()
}

const rl = readline.createInterface(process.stdin, process.stdout)

const promptYesNo = async (prompt: string, { def }: { def: boolean }) => {
  let loop = (resolve: any) => { // too lazy to write out the type for resolve
    rl.question(prompt + (def ? ' (y)/n: ' : ' y/(n): '), input => {
      if (input === '') {
        resolve(def)
      } else if (input.toLowerCase() === 'y') {
        resolve(true)
      } else if (input.toLowerCase() === 'n') {
        resolve(false)
      } else {
        console.log("Please enter 'y' or 'n'")
        loop(resolve)
      }
    })
  }
  return new Promise<boolean>((resolve, _) => { loop(resolve) })
}

const less = async (text: string) => execSync('echo \'' + text + '\' | less', { stdio: 'inherit' })

const emptyPrompt = (prompt: string) =>
  new Promise((resolve, _) => { rl.question(prompt, resolve) })

const genContract = async (
  eztz: EZTZ,
  contractPath: Path,
  tests: TestCaseData[],
  testFile: Path
) => {
  console.log('Generating new test data for "' + contractPath + '"...')
  let oldTests = prettyJson(tests)
  for (let test of tests) {
    test.expectedStorage = await runCase(eztz, contractPath, test)
  }
  await emptyPrompt('Inspect generated data (right). Please inspect carefully! [Enter to continue]')
  console.log(oldTests)
  console.log(prettyJson(tests))
  let d = await diff(oldTests, prettyJson(tests))
  console.log(d)
  let ok = await promptYesNo('Ok?', { def: false })
  if (!ok) {
    console.log('Generated data not ok. Preserving old test data for "' + contractPath + '".')
  } else {
    console.log('Writing new data for "' + contractPath + '".')
    await fs.writeJson(testFile, tests, { spaces: 2 })
  }
}

const readTestData = async (file: Path) => {
  let x = {
    exists: true,
    valid: true,
    tests: []
  }
  await fs.access(file, fs.constants.F_OK).catch(e => { if (e) x.exists = false })
  x.tests = await fs.readJson(file).catch(e => { if (e) x.valid = false })
  // TODO: better validation
  return x
}

export const test = async (
  compile: Compiler,
  eztz: EZTZ,
  contractGlob: Path,
  { generate }: { generate: boolean }
) => {
  let files = await glob(contractGlob)
  for (let file of files) {
    if (!file.endsWith('.liq')) continue
    let testFile = file + '.test.json'
    let testData = await readTestData(testFile)
    if (!testData.exists) {
      console.warn('Test file not found for "' + file + '". Skipping...')
      continue
    }
    if (!testData.valid) {
      console.error('Invalid test file for "' + file + '". Skipping...')
      continue
    }
    compile(file)
    if (generate) await genContract(eztz, file, testData.tests, testFile)
    else await testContract(eztz, file, testData.tests)
  }
}
