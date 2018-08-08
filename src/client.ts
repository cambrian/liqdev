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

function updateContracts (registry: Registry, contracts: I.Map<Name, KeyHash>): Registry {
  return {
    accounts: registry.accounts,
    contracts: contracts
  }
}

function findPKH (registry: Registry, name: Name): (KeyHash | undefined) {
  const account = registry.accounts.get(name)
  const contract = registry.contracts.get(name)
  if (account) return account.pkh
  if (contract) return contract
  return undefined
}

function deploy (tezosClient: TezosClient, keyGen: KeyGen) {
  return async (
    registry: Registry,
    name: Name,
    deployer: Name,
    contractFile: Path,
    storage: Sexp,
    balance: number
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

    if (!callerKeys) throw Error('caller name ' + caller + ' not found')
    if (!contractPKH) throw Error('contract name ' + contract + ' not found')

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
  return async (
    registry: Registry,
    name: Name,
    creator: Name,
    balance: number
  ): Promise<Registry> => {
    const account = keyGen.nextAccount()
    if (registry.accounts.get(name)) throw Error('account name ' + name + ' already exists')
    if (registry.contracts.get(name)) throw Error('account name ' + name + ' shared by a contract')

    const newRegistry = updateAccounts(registry, registry.accounts.set(name, account))
    transferFn(newRegistry, creator, name, balance)
    return newRegistry
  }
}

function transfer (eztz: EZTZ) {
  return async (registry: Registry, from: Name, to: Name, amount: number): Promise<void> => {
    const fromKeys = registry.accounts.get(from)
    const toPKH = findPKH(registry, to)

    if (!fromKeys) throw Error('from name ' + from + ' not found')
    if (!toPKH) throw Error('to name ' + to + ' not found')

    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    return eztz.rpc.transfer(fromKeys.pkh, fromKeys, toPKH, amount, 0, null, 100000, 0)
      .then(() => undefined)
  }
}

// TODO: Look into Tez unit differences.
function balance (eztz: EZTZ) {
  return async (registry: Registry, account: Name): Promise<number> => {
    const accountKeys = registry.accounts.get(account)
    if (!accountKeys) throw Error('account name ' + account + ' not found')
    return eztz.rpc.getBalance(accountKeys.pkh)
  }
}

function storage (eztz: EZTZ) {
  return async (registry: Registry, contract: Name): Promise<StorageResult> => {
    const contractPKH = registry.contracts.get(contract)
    if (!contractPKH) throw Error('contract name ' + contract + ' not found')
    return eztz.contract.storage(contractPKH)
  }
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
