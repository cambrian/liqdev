import { Account, Address, CallResult, EZTZ, KeyHash, Path, Sexp, StorageResult } from './types'

import { KeyGen } from './keygen'

export async function deploy (
  eztz: EZTZ,
  keyGen: KeyGen,
  deployer: Account,
  contractFile: Path,
  storage: Sexp
): Promise<KeyHash> {
  return Promise.reject('unimplemented')
}

// Eventually you will be able to
// specify a different entry point.
export async function call (
  eztz: EZTZ,
  caller: Account,
  contract: KeyHash,
  parameters: Sexp | null = null,
  amount: number = 0
): Promise<CallResult> {
  // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
  return eztz.contract.send(contract, caller.pkh, caller, amount, parameters, 0, 100000, 0)
}

export async function account (
  eztz: EZTZ,
  keyGen: KeyGen,
  originator: Account,
  balance: number
): Promise<Account> {
  const account = keyGen.nextAccount()
  transfer(eztz, originator, account, balance)
  return account
}

export async function transfer (
  eztz: EZTZ,
  from: Account,
  to: Account,
  amount: number
): Promise<void> {
  // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
  return eztz.rpc.transfer(from.pkh, from, to.pkh, amount, 0, null, 100000, 0)
    .then(() => undefined)
}

export async function balance (eztz: EZTZ, account: Account): Promise<number> {
  return eztz.rpc.getBalance(account.pkh)
}

export async function storage (eztz: EZTZ, contract: KeyHash): Promise<StorageResult> {
  return eztz.contract.storage(contract)
}
