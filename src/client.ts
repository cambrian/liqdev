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

import { ExecOutputReturnValue } from 'shelljs'
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

function clientAlias (
  tezosClient: TezosClient,
  account: Account,
  name: Name
): ExecOutputReturnValue {
  return tezosClient('add address ' + name + ' ' + account.pkh)
}

function deploy (tezosClient: TezosClient) {
  return async (
    registry: Registry,
    name: Name,
    deployer: Name,
    contractFile: Path,
    storage: Sexp,
    balance: number
  ): Promise<Registry> => {
    const deployerAccount = registry.accounts.get(deployer)
    if (!deployerAccount) throw new Error('deployer name ' + deployerAccount + ' not found')
    clientAlias(tezosClient, deployerAccount, deployer)

    const result = tezosClient('originate contract ' + name + ' for ' + deployer +
      ' transferring ' + balance.toString() + ' from ' + deployer + ' running ' + contractFile +
      ' --init \'' + storage + '\' | grep \'New contract\' | tr \' \' \'\n\' | sed -n \'x; $p\'')
    const contractAddress = result.stdout.slice(0, -1)

    if (contractAddress.length === 0) throw new Error('contract deploy failed')
    return updateContracts(registry, registry.contracts.set(name, contractAddress))
  }
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
    await transferFn(newRegistry, creator, name, balance)
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
    await eztz.rpc.transfer(fromKeys.pkh, fromKeys, toPKH, amount, 0, null, 100000, 0)
    return
  }
}

// TODO: Look into Tez unit differences.
function balance (eztz: EZTZ) {
  return (registry: Registry, account: Name): Promise<number> => {
    const keys = findPKH(registry, account)
    if (!keys) throw Error('account name ' + account + ' not found')
    return eztz.rpc.getBalance(keys)
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
    deploy: deploy(tezosClient),
    call: call(eztz),
    implicit: implicit(eztz, keyGen, transferFn),
    transfer: transferFn,
    balance: balance(eztz),
    storage: storage(eztz)
  }
}
