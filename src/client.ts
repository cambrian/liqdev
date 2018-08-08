import {
  CallResult,
  Client,
  EZTZ,
  KeyHash,
  Name,
  Path,
  Registry,
  Sexp,
  StorageResult,
  TezosClient
} from './types'

import { KeyGen } from './keygen'

function deploy (tezosClient: TezosClient, keyGen: KeyGen) {
  return async (
    registry: Registry,
    deployer: Account,
    contractFile: Path,
    storage: Sexp
  ): Promise<Registry> => Promise.reject('unimplemented')
}

// Eventually you will be able to
// specify a different entry point.
function call (eztz: EZTZ) {
  return async (
    registry: Registry,
    caller: Name,
    contract: Name,
    parameters: Sexp | null = null,
    amount: number = 0
  ): Promise<CallResult> =>
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    Promise.reject('unimplemented')
  // eztz.contract.send(contract, caller.pkh, caller, amount, parameters, 0, 100000, 0)
}

function account (
  eztz: EZTZ,
  keyGen: KeyGen,
  transferFn: (registry: Registry, from: Name, to: Name, amount: number) => Promise<void>
) {
  return async (registry: Registry, name: Name, originator: Name, balance: number): Promise<Registry> => {
    return Promise.reject('unimplemented')
    // const account = keyGen.nextAccount()
    // transferFn(originator, account, balance)
    // return account
  }
}

function transfer (eztz: EZTZ) {
  return async (registry: Registry, from: Name, to: Name, amount: number): Promise<void> =>
    Promise.reject('unimplemented')
  // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
  // eztz.rpc.transfer(from.pkh, from, to.pkh, amount, 0, null, 100000, 0).then(() => undefined)
}

function balance (eztz: EZTZ) {
  return async (registry: Registry, account: Name): Promise<number> =>
    Promise.reject('unimplemented')
  // eztz.rpc.getBalance(account.pkh)
}

function storage (eztz: EZTZ) {
  return async (registry: Registry, contract: Name): Promise<StorageResult> =>
    Promise.reject('unimplemented')
  // eztz.contract.storage(contract)
}

export function createClient (
  eztz: EZTZ,
  tezosClient: TezosClient,
  { seed } = { seed: 0 }
): Client {
  const transferFn = transfer(eztz)
  const keyGen = new KeyGen(eztz, seed)

  return {
    deploy: deploy(tezosClient, keyGen),
    call: call(eztz),
    account: account(eztz, keyGen, transferFn),
    transfer: transferFn,
    balance: balance(eztz),
    storage: storage(eztz)
  }
}
