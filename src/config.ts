export const commandName = 'liqdev'
export const compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
export const defaultProvider = 'http://127.0.0.1:18731'

export const unitTestExtension = '.utest.json'
export const integrationTestExtension = '.itest.json'
export const seed = 0

export const setupPath = {
  local: './lib/setup.sh',
  global: 'liqdev-setup'
}

export const bakerPath = {
  local: './lib/baker.sh',
  global: 'liqdev-baker'
}

export const clientPath = {
  local: './lib/client.sh',
  global: 'liqdev-client'
}

export const killPath = {
  local: './lib/kill.sh',
  global: 'liqdev-kill'
}

export const deployPath = {
  local: './lib/deploy.sh',
  global: 'liqdev-deploy'
}

// Bootstrap 1 in the sandbox.
export const testAccount = {
  pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
  pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
  sk: 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh'
}
