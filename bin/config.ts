export const commandName = 'liqdev'
export const compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
export const defaultProvider = 'http://127.0.0.1:18731'

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
