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

program
  .command('setup')
  .description('install Liquidity and Tezos')
  .action(() => shell.exec('liqdev-setup'))

program
  .parse(process.argv)

// Can this be chained as well?
if (program.args.length < 1) {
  console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '))
  process.exit(1)
}
