#!/usr/bin/env node

require('module-alias/register')

import * as program from 'commander'

import { Build } from '@src/build'
import { exec } from 'shelljs'
import { watch } from 'chokidar'

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
  // Decide whether to use global or local scripts based on command name.
  .action((cmd) => exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/setup.sh'))

// TODO: Make commands error gracefully if setup has not been run?

program
  .command('sandbox')
  .description('run sandbox Tezos network (node, client, and baker)')
  .action((cmd) => exec(process.argv[0] === 'liqdev' ? 'liqdev-sandbox' : './lib/sandbox.sh'))

program
  .command('build [contract]')
  .description('compile Liquidity contracts (omit parameter to watch)')
  .action((contract, args) => contract
    ? Build.compile(contract, exec)
    : Build.startWatcher(watch, exec))

program
  .parse(process.argv)

// Cannot be chained....
if (program.args.length < 1) {
  console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '))
  process.exit(1)
}
