#!/usr/bin/env node

require('module-alias/register')

import * as config from './config'
import * as fs from 'fs'
import * as os from 'os'
import * as program from 'commander'

import { createCompiler, startWatcher } from '@src/build'

import { exec } from 'shelljs'
import { eztz } from 'eztz'
import { spawn } from 'child_process'
import { test } from '@src/test'

const compile = createCompiler(config.compilerPath)
const runGlobally = process.argv[0] === config.commandName
console.log('Running all scripts ' + (runGlobally ? 'globally' : 'locally') + '.')

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
  .version('0.0.1', '-v, --version')
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

program
  .command('sandbox')
  .description('run sandbox Tezos network and set up client in shell')
  .action(verifySetup)
  .action(() => exec(runGlobally ? config.killPath.global : config.killPath.local))
  .action(() => exec(runGlobally ? config.killPath.global : config.killPath.local, {
    silent: true // Run kill again because sometimes once isn't enough...
  }))
  .action(() => spawn(runGlobally ? config.bakerPath.global
    : config.bakerPath.local, [], { detached: true, stdio: 'inherit' }).unref())

program
  .command('kill')
  .description('kills sandbox Tezos network')
  .action(() => exec(runGlobally ? config.killPath.global : config.killPath.local))

program
  .command('build [contract]')
  .description('compile Liquidity contracts (omit parameter to watch)')
  .action(verifySetup)
  .action((contract) => contract
    ? compile(contract + '.liq')
    : startWatcher(compile))

program
  .command('test [glob]')
  .description('test Liquidity files matching a glob pattern')
  .option('-g, --generate', 'generate or overwrite expected outputs')
  .action(verifySetup)
  .action((contractGlob, args) => test(compile, eztz, contractGlob, args))

program
  .command('deploy')
  .description('deploy contract to any of the tezos networks')
  .action(verifySetup)
  .action(() => exec(runGlobally ? config.deployPath.global : config.deployPath.local))

program
  .parse(process.argv)

// Cannot be chained....
if (program.args.length < 1) {
  console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '))
  process.exit(1)
}
