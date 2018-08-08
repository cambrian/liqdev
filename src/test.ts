import * as Mocha from 'mocha'
import * as _ from 'lodash'
import * as colors from 'colors'
import * as config from './config'
import * as fs from 'fs-extra'
import * as glob from 'glob-promise'
import * as readline from 'readline'

import { Client, Compiler, Diff, Key, Path, Sexp, Test, TestCmdParams } from './types'

import { diffJson as _diffJson } from 'diff'

// Sketchy workaround because diffJson TypeErrors if either input is undefined
function diffJson (
  a: any, b: any, { replaceUndefinedWithNull } = { replaceUndefinedWithNull: true }) {
  if (replaceUndefinedWithNull && a === undefined) a = null
  if (replaceUndefinedWithNull && b === undefined) b = null
  return _diffJson(a, b)
}

async function runUnitTest (client: Client, michelsonFile: Path, test: Test.Unit): Promise<Test.Unit.State> {
  let contractName = michelsonFile + ':' + test.name
  // Setup
  let registry = config.bootstrapRegistry
  for (let account of test.initial.accounts) {
    registry = await client.implicit(registry, account.name, 'bootstrap1', account.balance)
  }
  registry = await client.deploy(registry, contractName, 'bootstrap1', michelsonFile, test.initial.storage as string, test.initial.balance) // sus

  // Call contract from bootstrap account
  let storage = await client.call(registry, 'bootstrap1', contractName, test.call.params, test.call.amount)

  // Get final state
  let balance = await client.balance(registry, contractName) // Can we get this from .call?
  let accounts = await Promise.all(_.map(test.initial.accounts, async ({ name }) =>
    ({ name, balance: await client.balance(registry, name) })
  ))
  return { storage, balance, accounts }
}

async function runIntegrationTest (client: Client, test: Test.Integration): Promise<Test.Integration.State> {
  // Setup
  let registry = config.bootstrapRegistry
  for (let { name, balance } of test.initial.accounts) {
    registry = await client.implicit(registry, name, 'bootstrap1', balance)
  }
  for (let { name, file, balance, storage } of test.initial.contracts) {
    registry = await client.deploy(registry, name, 'bootstrap1', file, storage as string, balance) // sus
  }

  // Make contract calls
  for (let { amount, caller, contract, params } of test.calls) {
    await client.call(registry, caller, contract, params, amount)
  }

  // Get final state
  let contracts = await Promise.all(_.map(test.initial.contracts, async ({ name, file }) =>
    ({
      name,
      file,
      balance: await client.balance(registry, name),
      storage: await client.storage(registry, name)
    })
  ))
  let accounts = await Promise.all(_.map(test.initial.accounts, async ({ name }) =>
    ({ name, balance: await client.balance(registry, name) })
  ))
  return { accounts, contracts }
}

function diffToString (diff: Diff) {
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

function diffIsEmpty (diff: Diff) {
  for (let part of diff) {
    if (part.added || part.removed) return false
  }
  return true
}

const rl = readline.createInterface(process.stdin, process.stdout)

async function promptYesNo (prompt: string, { defaultValue }: { defaultValue: boolean }) {
  while (1) {
    let input = await new Promise<string>((resolve, _) => rl.question(prompt + (defaultValue ? ' (y)/n: ' : ' y/(n): '), resolve))
    if (input === '') return defaultValue
    if (input.toLowerCase() === 'y') return true
    if (input.toLowerCase() === 'n') return false
    console.log("Please enter 'y' or 'n'")
  }
  throw new Error('unreachable')
}

async function genUnitTestData (
  client: Client,
  testFilePairs: { michelsonFile: Path, testFile: Path }[]
) {
  for (let { michelsonFile, testFile } of testFilePairs) {
    await genTestData(testFile, async () => {
      let tests: Test.Unit[] = await fs.readJson(testFile)
      for (let test of tests) {
        test.expected = await runUnitTest(client, michelsonFile, test)
      }
      return tests
    })
  }
}

async function genIntegrationTestData (client: Client, testFiles: Path[]) {
  for (let testFile of testFiles) {
    await genTestData(testFile, async () => {
      let testData = await fs.readJson(testFile)
      testData.expected = runIntegrationTest(client, testData)
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
  let ok = await promptYesNo('Ok?', { defaultValue: false })
  if (!ok) {
    console.log('Generated data not ok. Preserving old test data for "' + testFile + '".')
  } else {
    console.log('Writing new data for "' + testFile + '".')
    await fs.writeJson(testFile, proposed, { spaces: 2 })
  }
}

function mochaTest (name: string, { expected, actual }: { expected: any, actual: any }) {
  return new Mocha.Test(name, () => {
    let diff = diffJson(expected, actual)
    if (!diffIsEmpty(diff)) {
      let s = diffToString(diff)
      throw new Error('Contract produced nonzero diff with expected storage (red):\n' + s)
    }
  })
}

async function unitTestSuite (
  client: Client,
  testFilePairs: { michelsonFile: Path, testFile: Path }[]
) {
  let suite = new Mocha.Suite('Unit Tests')
  for (let { michelsonFile, testFile } of testFilePairs) {
    let tests: Test.Unit[] = await fs.readJson(testFile)
    // TODO: validate tests object against Test.Unit[]
    let s = new Mocha.Suite(testFile)
    for (let test of tests) {
      let actual = await runUnitTest(client, michelsonFile, test)
      s.addTest(mochaTest(test.name, { actual, expected: test.expected }))
    }
    suite.addSuite(s)
  }
  return suite
}

async function integrationTestSuite (client: Client, testFiles: Path[]) {
  let suite = new Mocha.Suite('Integration Tests')
  for (let testFile of testFiles) {
    let testData: Test.Integration = await fs.readJson(testFile)
    // TODO: validate test object against Test.Integration
    let actual = await runIntegrationTest(client, testData)
    suite.addTest(mochaTest(testFile, { expected: testData.expected, actual }))
  }
  return suite
}

/**
 * @param globPattern Matches contracts AND test files (so leave out the extension when calling this)
 */
export async function test (
  compile: Compiler,
  client: Client,
  {
    generate,
    unit,
    integration
  }: TestCmdParams,
  globPattern = '**/*'
) {
  console.log(globPattern)
  if (!unit && !integration) {
    unit = true
    integration = true
  }
  let files = await glob(globPattern)

  let contractFiles = _.filter(files, f => f.endsWith('.liq'))
  for (let contractFile of contractFiles) compile(contractFile)

  let unitTestFiles = _.filter(files, f => f.endsWith(config.unitTestExtension))
  let unitTestFilePairs = _.map(unitTestFiles, testFile => ({
    testFile,
    michelsonFile: _.trimEnd(testFile, config.unitTestExtension) + '.tz'
  }))
  let integrationTestFiles = _.filter(files, f => f.endsWith(config.integrationTestExtension))

  if (generate) {
    if (unit) await genUnitTestData(client, unitTestFilePairs)
    if (integration) await genIntegrationTestData(client, integrationTestFiles)
  } else {
    let mocha = new Mocha()
    if (unit) mocha.suite.addSuite(await unitTestSuite(client, unitTestFilePairs))
    if (integration) mocha.suite.addSuite(await integrationTestSuite(client, integrationTestFiles))
    await new Promise((resolve, _) => mocha.run(resolve))
  }
}
