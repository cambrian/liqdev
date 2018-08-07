import { Account, Address, CallResult, EZTZ, KeyHash, Path, Sexp } from './types'

import { KeyGen } from './keygen'

async function deploy (
  eztz: EZTZ,
  keyGen: KeyGen,
  deployer: Account,
  contractFile: Path,
  storage: Sexp
): Promise<KeyHash> {
  return Promise.reject('unimplemented')
}

// Eventually you will be able to specify a different entry point.
async function call (eztz: EZTZ, keyGen: KeyGen, contract: KeyHash, parameters: Sexp): Promise<CallResult> {
  return Promise.reject('unimplemented')
}

async function originate (
  eztz: EZTZ,
  keyGen: KeyGen,
  originator: Account,
  balance: number
): Promise<Account> {
  return Promise.reject('unimplemented')
}

async function transfer (
  eztz: EZTZ,
  keyGen: KeyGen,
  from: Account,
  to: Account,
  amount: number
): Promise<void> {
  return Promise.reject('unimplemented')
}

async function balance (eztz: EZTZ, keyGen: KeyGen, account: Account): Promise<number> {
  return Promise.reject('unimplemented')
}

// TODO: Update any after pull.
async function storage (eztz: EZTZ, keyGen: KeyGen, contract: KeyHash): Promise<any> {
  return Promise.reject('unimplemented')
}
