import * as Mocha from 'mocha'
import * as _ from 'lodash'
import * as colors from 'colors'
import * as config from './config'
import * as eztz from 'eztz'
import * as fs from 'fs-extra'
import * as readline from 'readline'
import * as runGlob from 'glob-promise'

import { Address, Compiler, Diff, EZTZ, Key, Path, Sexp, Test, TestCmdParams } from './types'

import { KeyGen } from './keygen'
import { diffJson as _diffJson } from 'diff'

// Sketchy workaround because diffJson TypeErrors if either input is undefined
const diffJson = (a: any, b: any) => {
  if (a === undefined) a = null
  if (b === undefined) b = null
  return _diffJson(a, b)
}

async function runUnitTest (eztz: EZTZ, michelsonFile: Path, testData: Test.Unit): Promise<Test.Unit.State> {
  // TODO
  // let contract = await deploy(eztz, testAccount.sk, contractFile, testData.initialStorage)
  // return call(eztz, contract, testAccount.sk, data.callParams)
  return Object()
}

async function runIntegrationTest (eztz: EZTZ, testData: Test.Integration): Promise<Test.Integration.State> {
  // TODO
  return Object()
}

const diffToString = (diff: Diff) => {
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

const diffIsEmpty = (diff: Diff) => {
  for (let part of diff) {
    if (part.added || part.removed) return false
  }
  return true
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

async function genUnitTestData (
  eztz: EZTZ,
  testFilePairs: { michelsonFile: Path, testFile: Path }[]
) {
  for (let { michelsonFile, testFile } of testFilePairs) {
    await genTestData(testFile, async () => {
      let tests: Test.Unit[] = await fs.readJson(testFile)
      for (let test of tests) {
        test.expected = await runUnitTest(eztz, michelsonFile, test)
      }
      return tests
    })
  }
}

async function genIntegrationTestData (eztz: EZTZ, testFiles: Path[]) {
  for (let testFile of testFiles) {
    await genTestData(testFile, async () => {
      let testData = await fs.readJson(testFile)
      testData.expected = runIntegrationTest(eztz, testData)
      return testData
    })
  }
}

async function genTestData (testFile: Path, getProposedTestFile: () => Promise<any>) {
  let current = await fs.readJson(testFile)
  console.log('Generating new test data for "' + testFile + '"...')
  let proposed = await getProposedTestFile()
  console.log('Inspect generated diff. Any changes will be highlighted.')
  console.log(diffToString(diffJson(current, proposed)))
  let ok = await promptYesNo('Ok?', { def: false })
  if (!ok) {
    console.log('Generated data not ok. Preserving old test data for "' + testFile + '".')
  } else {
    console.log('Writing new data for "' + testFile + '".')
    await fs.writeJson(testFile, proposed, { spaces: 2 })
  }
}

function makeMochaTest (name: string, runTest: () => Promise<{ actual: any, expected: any }>) {
  return new Mocha.Test(name, async () => {
    let { actual, expected } = await runTest()
    let diff = diffJson(expected, actual)
    if (!diffIsEmpty(diff)) {
      let s = diffToString(diff)
      throw new Error('Contract produced nonzero diff with expected storage (red):\n' + s)
    }
  })
}

function unitTestSuite (
  eztz: EZTZ,
  testFilePairs: { michelsonFile: Path, testFile: Path }[]
) {
  let suite = new Mocha.Suite('Unit Tests')
  for (let { michelsonFile, testFile } of testFilePairs) {
    let tests: Test.Unit[] = fs.readJsonSync(testFile) // TODO: can/should be async?
    // TODO: validate tests object against Test.Unit[]
    let s = new Mocha.Suite(testFile)
    for (let test of tests) {
      s.addTest(makeMochaTest(test.name, async () => {
        let actual = await runUnitTest(eztz, michelsonFile, test)
        return { actual, expected: test.expected }
      }))
    }
    suite.addSuite(s)
  }
  return suite
}

function integrationTestSuite (eztz: EZTZ, testFiles: Path[]) {
  let suite = new Mocha.Suite('Integration Tests')
  for (let testFile of testFiles) {
    suite.addTest(makeMochaTest(testFile, async () => {
      let testData: Test.Integration = await fs.readJson(testFile)
      // TODO: validate test object against Test.Integration
      let actual = await runIntegrationTest(eztz, testData)
      return { actual, expected: testData.expected }
    }))
  }
  return suite
}

/**
 * @param glob Matches contracts AND test files (so leave out the extension when calling this)
 */
export async function test (
  compile: Compiler,
  eztz: EZTZ,
  {
    generate,
    unit,
    integration
  }: TestCmdParams,
  glob = '**/*'
) {
  if (!unit && !integration) {
    unit = true
    integration = true
  }
  const keyGen = new KeyGen(eztz, config.seed)
  let files = await runGlob(glob) // BUG: not working??
  console.log(files)

  let contractFiles = _.filter(files, f => f.endsWith('.liq'))
  for (let contractFile of contractFiles) compile(contractFile)

  let unitTestFiles = _.filter(files, f => f.endsWith(config.unitTestExtension))
  let unitTestFilePairs =
    _.map(unitTestFiles, testFile =>
      ({
        testFile,
        michelsonFile: testFile.substr(0, testFile.length - config.unitTestExtension.length) + '.tz'
      }))
  let integrationTestFiles = _.filter(files, f => f.endsWith(config.integrationTestExtension))

  if (generate) {
    if (unit) await genUnitTestData(eztz, unitTestFilePairs)
    if (integration) await genIntegrationTestData(eztz, integrationTestFiles)
  } else {
    let suite = new Mocha.Suite('Liqdev Tests')
    let runner = new Mocha.Runner(suite, false)
    // runner is never called explicitly but is necessary to create
    let _runner = new Mocha.reporters.Spec(runner)
    if (unit) suite.addSuite(unitTestSuite(eztz, unitTestFilePairs))
    if (integration) suite.addSuite(integrationTestSuite(eztz, integrationTestFiles))
    runner.run()
  }
}
