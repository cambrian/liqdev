import { Account, Address, CallResult, EZTZ, KeyHash, Path, Sexp } from './types'

import { KeyGen } from './keygen'

async function deploy (
  eztz: EZTZ,
  deployer: Account,
  contractFile: Path,
  storage: Sexp
): Promise<KeyHash> {
  return Promise.reject('unimplemented')
}

// Eventually you will be able to specify a different entry point.
async function call (eztz: EZTZ, contract: KeyHash, parameters: Sexp): Promise<CallResult> {
  return Promise.reject('unimplemented')
}

async function originate (eztz: EZTZ, originator: Account, balance: number): Promise<Account> {
  return Promise.reject('unimplemented')
}

async function transfer (eztz: EZTZ, from: Account, to: Account, amount: number): Promise<void> {
  return Promise.reject('unimplemented')
}

async function balance (eztz: EZTZ, account: Account): Promise<number> {
  return Promise.reject('unimplemented')
}

// TODO: Update any after pull.
async function storage (eztz: EZTZ, contract: KeyHash): Promise<any> {
  return Promise.reject('unimplemented')
}
