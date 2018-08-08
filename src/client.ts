import * as I from 'immutable'

import {
  Account,
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

function updateAccounts (registry: Registry, accounts: I.Map<Name, Account>): Registry {
  return {
    accounts: accounts,
    contracts: registry.contracts
  }
}

function deploy (tezosClient: TezosClient, keyGen: KeyGen) {
  return async (
    registry: Registry,
    deployer: Name,
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
  ): Promise<CallResult> => {
    const callerKeys = registry.accounts.get(caller)
    const contractPKH = registry.contracts.get(contract)

    if (!callerKeys) return Promise.reject('caller name ' + caller + ' not found')
    if (!contractPKH) return Promise.reject('contract name ' + contract + ' not found')

    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    return eztz.contract.send(contractPKH, callerKeys.pkh, callerKeys, amount, parameters, 0,
      100000, 0)
  }
}

function implicit (
  eztz: EZTZ,
  keyGen: KeyGen,
  transferFn: (registry: Registry, from: Name, to: Name, amount: number) => Promise<void>
) {
  return async (registry: Registry, name: Name, originator: Name, balance: number): Promise<Registry> => {
    const account = keyGen.nextAccount()
    const newRegistry = registry.accounts.
    // transferFn(originator, account, balance)
    // return account
    return Promise.reject()
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
    implicit: implicit(eztz, keyGen, transferFn),
    transfer: transferFn,
    balance: balance(eztz),
    storage: storage(eztz)
  }
}
