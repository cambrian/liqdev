#!/usr/bin/env node

require('module-alias/register')

import * as fs from 'fs'
import * as os from 'os'
import * as program from 'commander'

import { Build } from '@src/build'
import { exec } from 'shelljs'
import { watch } from 'chokidar'

const verifySetup = () => {
  const compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
    .replace(/^~/, os.homedir())
  if (!fs.existsSync(compilerPath)) {
    console.log('Liquidity compiler not found.')
    console.error('You must run setup before running any other tasks.')
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
  // Decide whether to use global or local scripts based on command name.
  .action(() => exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/setup.sh'))

program
  .command('sandbox')
  .description('run sandbox Tezos network (node, client, and baker)')
  .action(verifySetup)
  .action(() => exec(process.argv[0] === 'liqdev' ? 'liqdev-sandbox' : './lib/sandbox.sh'))

program
  .command('build [contract]')
  .description('compile Liquidity contracts (omit parameter to watch)')
  .action(verifySetup)
  .action((contract, args) => contract
    ? Build.compile(contract, exec)
    : Build.startWatcher(watch, exec))

program
  .command('deploy')
  .description('deploy contract to any of the tezos networks')
  .action(verifySetup)
  .action(() => console.log('This command is still experimental.'))
  .action(() => exec(process.argv[0] === 'liqdev' ? 'liqdev-deploy' : './lib/deploy.sh'))

program
  .parse(process.argv)

// Cannot be chained....
if (program.args.length < 1) {
  console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '))
  process.exit(1)
}
