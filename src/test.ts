import * as Mocha from 'mocha'
import * as _ from 'lodash'
import * as colors from 'colors'
import * as config from './config'
import * as fs from 'fs-extra'
import * as glob from 'glob-promise'
import * as path from 'path'
import * as readline from 'readline'

import { Client, Compiler, Diff, Path, Test, TestCmdParams } from './types'

import { diffJson as _diffJson } from 'diff'

// Sketchy workaround because diffJson TypeErrors
// if either input is undefined.
function diffJson (
  a: any, b: any, { replaceUndefinedWithNull } = { replaceUndefinedWithNull: true }) {
  if (replaceUndefinedWithNull && a === undefined) a = null
  if (replaceUndefinedWithNull && b === undefined) b = null
  return _diffJson(a, b)
}

async function runUnitTest (
  client: Client,
  michelsonFile: Path,
  test: Test.Unit
): Promise<Test.Unit.State> {
  const contractName = michelsonFile + ':' + test.name
  // Setup
  let registry = config.bootstrapRegistry
  for (const { name, balance } of test.initial.accounts) {
    registry = await client.implicit(
      registry,
      name,
      config.bootstrapAccount,
      balance)
  }
  registry = await client.deploy(
    registry,
    contractName,
    config.bootstrapAccount,
    michelsonFile,
    test.initial.storage as string, // Sus.
    test.initial.balance
  )

  // Call contract from bootstrap account.
  const result = await client.call(
    registry,
    config.bootstrapAccount,
    contractName,
    test.call.params,
    test.call.amount
  )

  // Get final state.
  const balance = await client.balance(registry, contractName) // Can we get this from .call?
  const accounts = await Promise.all(_.map(test.initial.accounts, async ({ name }) =>
    ({ name, balance: await client.balance(registry, name) })
  ))
  // @ts-ignore gnarly way to get storage from call result without having to call client.storage
  const storage = result.operations[result.operations.length - 1].metadata.operation_result.storage
  return { storage, balance, accounts }
}

// Needs [dir] because contract paths are specified relative to the test file directory
async function runIntegrationTest (
  client: Client,
  dir: Path,
  test: Test.Integration
): Promise<Test.Integration.State> {
  // Setup.
  let registry = config.bootstrapRegistry
  for (const { name, balance } of test.initial.accounts) {
    registry = await client.implicit(
      registry,
      name,
      config.bootstrapAccount,
      balance)
  }
  for (const { name, file, balance, storage } of test.initial.contracts) {
    registry = await client.deploy(
      registry,
      name,
      config.bootstrapAccount,
      path.join(dir, file + '.tz'), // Sus.
      storage as string, // Also sus.
      balance
    )
  }

  // Make contract calls.
  for (const { amount, caller, contract, params } of test.calls) {
    await client.call(registry, caller, contract, params, amount)
  }

  // Get final state.
  const accounts = await Promise.all(_.map(test.initial.accounts, async ({ name }) =>
    ({ name, balance: await client.balance(registry, name) })
  ))
  const contracts = await Promise.all(_.map(test.initial.contracts, async ({ name, file }) =>
    ({
      name,
      file,
      balance: await client.balance(registry, name),
      storage: await client.storage(registry, name)
    })
  ))
  return { accounts, contracts }
}

function diffToString (diff: Diff) {
  let s = ''
  for (const part of diff) {
    const color = part.added
      ? colors.green
      : part.removed
        ? colors.red
        : colors.grey
    s += color(part.value)
  }
  return s
}

function diffIsEmpty (diff: Diff) {
  for (const part of diff) {
    if (part.added || part.removed) return false
  }
  return true
}

const rl = readline.createInterface(process.stdin, process.stdout)

async function promptYesNo (prompt: string, { defaultValue }: { defaultValue: boolean }) {
  prompt = prompt + (defaultValue ? ' (y)/n: ' : ' y/(n): ')
  while (1) {
    const input = await new Promise<string>((resolve, _) => rl.question(prompt, resolve))
    if (input === '') return defaultValue
    if (input.toLowerCase() === 'y') return true
    if (input.toLowerCase() === 'n') return false
    console.log("Please enter 'y' or 'n'.")
  }
  throw new Error('unreachable')
}

// provide helpful defaults to the test writer
async function readUnitTestFile (file: Path) {
  const tests: Test.Unit[] = await fs.readJson(file)
  for (const test of tests) {
    if (!test.initial.balance) test.initial.balance = 0
    if (!test.initial.accounts) test.initial.accounts = []
    for (const account of test.initial.accounts) {
      if (!account.balance) account.balance = 0
    }
    if (!test.call.amount) test.call.amount = 0
    if (!test.call.caller) test.call.caller = config.bootstrapAccount
  }
  return tests
}

// provide helpful defaults to the test writer
async function readIntegrationTestFile (file: Path) {
  const test: Test.Integration = await fs.readJson(file)
  if (!test.initial.accounts) test.initial.accounts = []
  for (const account of test.initial.accounts) {
    if (!account.balance) account.balance = 0
  }
  if (!test.initial.contracts) throw new Error('No contracts in integration test data: ' + file)
  for (const contract of test.initial.contracts) {
    if (!contract.balance) contract.balance = 0
  }
  for (const call of test.calls) {
    if (!call.amount) call.amount = 0
    if (!call.caller) call.caller = config.bootstrapAccount
  }
  return test
}

async function genUnitTestData (
  client: Client,
  testFilePairs: { michelsonFile: Path, testFile: Path }[]
) {
  for (const { michelsonFile, testFile } of testFilePairs) {
    await genTestData(testFile, async () => {
      const tests = await readUnitTestFile(testFile)
      for (const test of tests) {
        test.expected = await runUnitTest(client, michelsonFile, test)
      }
      return tests
    })
  }
}

async function genIntegrationTestData (client: Client, testFiles: Path[]) {
  for (const testFile of testFiles) {
    await genTestData(testFile, async () => {
      const testData = await readIntegrationTestFile(testFile)
      testData.expected = await runIntegrationTest(client, path.dirname(testFile), testData)
      return testData
    })
  }
}

async function genTestData (testFile: Path, proposedTestFile: () => Promise<any>) {
  const current = await fs.readJson(testFile)
  console.log('Generating new test data for "' + testFile + '"...')
  const proposed = await proposedTestFile()
  console.log('Inspect generated diff. Any changes will be highlighted.')
  console.log(diffToString(diffJson(current, proposed)))
  const ok = await promptYesNo('Ok?', { defaultValue: false })
  if (!ok) {
    console.log('Generated data not ok. Preserving old test data for "' + testFile + '".')
  } else {
    console.log('Writing new data for "' + testFile + '".')
    await fs.writeJson(testFile, proposed, { spaces: 2 })
  }
}

function mochaTest (name: string, { expected, actual }: { expected: any, actual: any }) {
  return new Mocha.Test(name, () => {
    const diff = diffJson(expected, actual)
    if (!diffIsEmpty(diff)) {
      const s = diffToString(diff)
      throw new Error('contract produced nonzero diff with expected storage (red):\n' + s)
    }
  })
}

async function unitTestSuite (
  client: Client,
  testFilePairs: { michelsonFile: Path, testFile: Path }[]
) {
  const suite = new Mocha.Suite('Unit Tests')
  for (const { michelsonFile, testFile } of testFilePairs) {
    const tests = await readUnitTestFile(testFile)
    const s = new Mocha.Suite(testFile)
    for (const test of tests) {
      const actual = await runUnitTest(client, michelsonFile, test)
      s.addTest(mochaTest(test.name, { actual, expected: test.expected }))
    }
    suite.addSuite(s)
  }
  return suite
}

async function integrationTestSuite (client: Client, testFiles: Path[]) {
  const suite = new Mocha.Suite('Integration Tests')
  for (const testFile of testFiles) {
    const test = await readIntegrationTestFile(testFile)
    const actual = await runIntegrationTest(client, path.dirname(testFile), test)
    suite.addTest(mochaTest(testFile, { expected: test.expected, actual }))
  }
  return suite
}

/**
 * @param globPattern Matches contracts AND test files (so leave out the extension when calling
 * this).
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
  const files = await glob(globPattern)
  const contractFiles = _.filter(files, f => f.endsWith('.liq'))
  for (let contractFile of contractFiles) compile(contractFile)

  const unitTestFiles = _.filter(files, f => f.endsWith(config.unitTestExtension))
  const unitTestFilePairs = _.map(unitTestFiles, testFile => ({
    testFile,
    michelsonFile: _.trimEnd(testFile, config.unitTestExtension) + '.tz'
  }))
  const integrationTestFiles = _.filter(files, f => f.endsWith(config.integrationTestExtension))

  if (generate) {
    if (unit) await genUnitTestData(client, unitTestFilePairs)
    if (integration) await genIntegrationTestData(client, integrationTestFiles)
  } else {
    const mocha = new Mocha()
    if (unit) mocha.suite.addSuite(await unitTestSuite(client, unitTestFilePairs))
    if (integration) mocha.suite.addSuite(await integrationTestSuite(client, integrationTestFiles))
    await new Promise((resolve, _) => mocha.run(resolve))
  }
}
