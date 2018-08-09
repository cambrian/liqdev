import { Map } from 'immutable'
import { Registry } from './types'

export const bootstrapAccount = 'bootstrap1'
export const commandName = 'liqdev'
export const compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
export const tezosClientPath = '~/.liqdev/.tezos-client-path'
export const defaultProvider = 'http://127.0.0.1:18731'

export const unitTestExtension = '.utest.json'
export const integrationTestExtension = '.itest.json'
export const clientWait = 0.25
export const seed = 0

export const bootstrapAccounts = {
  bootstrap1: {
    sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
    pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
    pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx'
  }
}

export const bootstrapRegistry: Registry = {
  accounts: Map(bootstrapAccounts),
  contracts: Map()
} as Registry

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

export const whichPath = {
  local: './lib/which.sh',
  global: 'liqdev-which'
}
