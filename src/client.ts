import {
  Account,
  CallResult,
  Client,
  EZTZ,
  KeyHash,
  Path,
  Sexp,
  StorageResult,
  TezosClient
} from './types'

import { KeyGen } from './keygen'

function createDeployFn (tezosClient: TezosClient, keyGen: KeyGen) {
  return async (deployer: Account, contractFile: Path, storage: Sexp): Promise<KeyHash> => Promise.reject('unimplemented')
}

// Eventually you will be able to
// specify a different entry point.
function createCallFn (eztz: EZTZ) {
  return async (
    caller: Account,
    contract: KeyHash,
    parameters: Sexp | null = null,
    amount: number = 0
  ): Promise<CallResult> =>
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    eztz.contract.send(contract, caller.pkh, caller, amount, parameters, 0, 100000, 0)
}

function createAccountFn (
  eztz: EZTZ,
  keyGen: KeyGen,
  transferFn: (from: Account, to: Account, amount: number) => Promise<void>
) {
  return async (originator: Account, balance: number): Promise<Account> => {
    const account = keyGen.nextAccount()
    transferFn(originator, account, balance)
    return account
  }
}

function createTransferFn (eztz: EZTZ) {
  return async (from: Account, to: Account, amount: number): Promise<void> =>
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    eztz.rpc.transfer(from.pkh, from, to.pkh, amount, 0, null, 100000, 0).then(() => undefined)
}

function createBalanceFn (eztz: EZTZ) {
  return async (account: Account): Promise<number> => eztz.rpc.getBalance(account.pkh)
}

function createStorageFn (eztz: EZTZ) {
  return async (contract: KeyHash): Promise<StorageResult> => eztz.contract.storage(contract)
}

export function createClient (eztz: EZTZ, tezosClient: TezosClient, { seed } = { seed: 0 }): Client {
  const transferFn = createTransferFn(eztz)
  const keyGen = new KeyGen(eztz, seed)
  return {
    deploy: createDeployFn(tezosClient, keyGen),
    call: createCallFn(eztz),
    account: createAccountFn(eztz, keyGen, transferFn),
    transfer: transferFn,
    balance: createBalanceFn(eztz),
    storage: createStorageFn(eztz)
  }
}
