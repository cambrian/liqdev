#!/usr/bin/env node
require('source-map-support').install()

import * as config from './config'
import * as fs from 'fs'
import * as os from 'os'
import * as program from 'commander'

import { Path, TezosClient } from './types'
import { createCompiler, startWatcher } from './build'

import { createClient } from './client'
import { exec } from 'shelljs'
import { eztz } from 'eztz'
import { spawn } from 'child_process'
import { test } from './test'

const compile = createCompiler(config.compilerPath as Path)
const globalBinPath = exec('npm bin -g', { silent: true }).stdout.toString().slice(0, -1) // Lmao.
const runGlobally = process.argv[1] === globalBinPath + '/' + config.commandName
console.log('Running all scripts ' + (runGlobally ? 'globally' : 'locally') + '.')

// Not called directly to defer its
// execution (only test needs this).
const createTezosClient = (): TezosClient => {
  const tezosClientPath = fs.readFileSync(config.tezosClientPath.replace(/^~/, os.homedir()))
    .slice(0, -1) // Lmao again (strip new line character).
  return ((command: string) =>
    exec(tezosClientPath + ' ' + command, { silent: true, async: false })) as TezosClient
}

// Hard-coded but should eventually be an option.
eztz.node.setProvider(config.defaultProvider)

const verifySetup = () => {
  const compilerPathAbsolute = config.compilerPath.replace(/^~/, os.homedir())
  if (!fs.existsSync(compilerPathAbsolute)) {
    console.log('Liquidity compiler not found.')
    console.error('You must run setup before running any other tasks.')
    process.exit(1)
  }
}

const verifySandbox = () => {
  const result = exec('lsof -i :18731 | grep main_bake', { silent: true })
  if (result.stdout.toString().length <= 0) {
    console.log('Sandbox is not running.')
    console.log('You must run the sandbox to run Liquidity contracts.')
    process.exit(1)
  }
}

program
  .version('0.2.0', '-v, --version')
  .description('Swiss army knife for Liquidity development')
  .on('command:*', () => {
    console.error('Invalid task provided: %s.\nSee --help for available tasks.',
      program.args.join(' '))
    process.exit(1)
  })

program
  .command('setup')
  .description('install Liquidity and Tezos')
  .action(() => exec(runGlobally ? config.setupPath.global : config.setupPath.local))
  .action(() => process.exit(0)) // TODO: Figure out a more sustainable solution.

program
  .command('sandbox')
  .description('run sandbox Tezos network and set up client in shell')
  .action(verifySetup)
  .action(() => exec(runGlobally ? config.killPath.global : config.killPath.local))
  .action(() => spawn(runGlobally ? config.bakerPath.global
    : config.bakerPath.local, [], { detached: true, stdio: 'inherit' }).unref())
  .action(() => exec('sleep 6'))
  .action(() => process.exit(0))

program
  .command('kill')
  .description('kills sandbox Tezos network')
  .action(() => exec(runGlobally ? config.killPath.global : config.killPath.local))
  .action(() => process.exit(0))

program
  .command('build [glob="**/*"]')
  .description('compile Liquidity contracts in watch mode (only compiles .liq files)')
  .action(verifySetup)
  .action((glob) => startWatcher(compile, glob))

program
  .command('test [glob="**/*]')
  .description('test Liquidity files matching a glob pattern')
  .option('-g, --generate', 'generate or overwrite expected data')
  .option('-u, --unit', 'run only unit tests')
  .option('-i, --integration', 'run only integration tests')
  .action(verifySetup)
  .action(verifySandbox)
  .action((glob, args) => test(compile, createClient(eztz, createTezosClient()), args, glob)
    .then(() => process.exit(0)))

program
  .command('deploy')
  .description('deploy contract to any of the tezos networks')
  .action(verifySetup)
  .action(() => exec(runGlobally ? config.deployPath.global : config.deployPath.local))
  .action(() => process.exit(0))

program
  .parse(process.argv)

// Cannot be chained....
if (program.args.length < 1) {
  console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '))
  process.exit(1)
}
