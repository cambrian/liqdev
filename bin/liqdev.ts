#!/usr/bin/env node

import * as program from 'commander'
import * as shell from 'shelljs'

program
  .version('0.0.1', '-v, --version')
  .description('Swiss army knife for Liquidity development')
  .on('command:*', () => {
    console.error('Invalid task provided: %s.\nSee --help for available tasks.',
      program.args.join(' '))
    process.exit(1)
  })

  .command('setup')
    .description('install Liquidity and Tezos')
    // Decide whether to use global or local scripts based on command name.
    .action((cmd) => shell.exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/setup.sh'))

  .command('sandbox')
    .description('run sandbox tezos network (node, client, and baker)')
    .action((cmd) => shell.exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/sandbox.sh'))

  .parse(process.argv)

// Or maybe this?
if (program.args.length < 1) {
  console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '))
  process.exit(1)
}
