import * as Mocha from 'mocha'
import * as colors from 'colors'
import * as eztz from 'eztz'
import * as fs from 'fs-extra'
import * as glob from 'glob-promise'
import * as readline from 'readline'

import { Address, Compiler, EZTZ, Key, Path, Sexp, TestCaseData } from './types'

import { diffJson } from 'diff'
import { testAccount } from './config'

// TODO: Finish all of these functions.
const runCase = async (eztz: EZTZ, contractFile: Path, data: TestCaseData) => {
  let contract = await deploy(eztz, testAccount.sk, contractFile, data.initialStorage)
  return call(eztz, contract, testAccount.sk, data.callParams)
}

const diffToString = (diff: JsDiff.IDiffResult[]) => {
  let s = ''
  for (let part of diff) {
    let color = part.added
      ? colors.green
      : part.removed
        ? colors.red
        : colors.grey
    s += color(part.value)
  }
  return s
}

const diffIsEmpty = (diff: JsDiff.IDiffResult[]) => {
  for (let part of diff) {
    if (part.added || part.removed) return false
  }
  return true
}

const testContract = async (
  eztz: EZTZ,
  contractFile: Path,
  tests: TestCaseData[]
) => {
  let suite = new Mocha.Suite(contractFile)
  let runner = new Mocha.Runner(suite, false)
  // runner is never called explicitly but is necessary to create
  let _ = new Mocha.reporters.Spec(runner)

  for (let test of tests) {
    let newStorage = await runCase(eztz, contractFile, test)
    let diff = diffJson(test.expectedStorage, newStorage)
    suite.addTest(new Mocha.Test(test.name, async () => {
      if (!diffIsEmpty(diff)) {
        let s = diffToString(diff)
        throw new Error('Contract produced nonzero diff with expected storage (red):\n' + s)
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

const genTestData = async (
  eztz: EZTZ,
  contractFile: Path,
  tests: TestCaseData[],
  testFile: Path
) => {
  console.log('Generating new test data for "' + contractFile + '"...')
  let oldTests = JSON.parse(JSON.stringify(tests))
  for (let test of tests) {
    test.expectedStorage = await runCase(eztz, contractFile, test)
  }
  console.log('Inspect generated diff. Any changes will be highlighted.')
  console.log(diffToString(diffJson(oldTests, tests)))
  let ok = await promptYesNo('Ok?', { def: false })
  if (!ok) {
    console.log('Generated data not ok. Preserving old test data for "' + contractFile + '".')
  } else {
    console.log('Writing new data for "' + contractFile + '".')
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
    if (generate) await genTestData(eztz, file, testData.tests, testFile)
    else await testContract(eztz, file, testData.tests)
  }
}
