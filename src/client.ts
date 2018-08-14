import * as I from 'immutable'
import * as now from 'nano-time'

import {
  Account,
  CallResult,
  Client,
  EZTZ,
  KeyHash,
  MuTez,
  Name,
  Path,
  Registry,
  Sexp,
  StorageResult,
  Tez,
  TezosClient
} from './types'

import { ExecOutputReturnValue } from 'shelljs'

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
  return tezosClient('add address ' + name + ' ' + account.pkh + ' --force')
}

// Make unique names so successive tests don't stomp on each other.
function uniqueName (name: string): Name {
  return name + '-' + now() as Name
}

function deploy (eztz: EZTZ, tezosClient: TezosClient): Client['deploy'] {
  return (
    registry: Registry,
    name: Name,
    deployer: Name,
    contractFile: Path,
    storage: Sexp,
    balance: MuTez
  ): Promise<Registry> => {
    const deployerAccount = registry.accounts.get(deployer)
    if (!deployerAccount) throw new Error('deployer name ' + deployerAccount + ' not found')

    // TODO: Fix this special casing later if and when
    // we need to test deploys from other accounts.
    if (deployer.slice(0, 9) !== 'bootstrap') {
      deployer = uniqueName(deployer)
      clientAlias(tezosClient, deployerAccount, deployer)
    }

    // TODO: Make this less brittle, probably using EZTZ.
    const tezBalance = eztz.utility.totez(balance)
    const contractAddress = tezosClient('originate contract ' + uniqueName(name) + ' for ' +
      deployer + ' transferring ' + tezBalance.toString() + ' from ' + deployer + ' running ' +
      contractFile + ' --init \'' + storage + '\' | grep \'New contract\' | ' +
      'tr \' \' \'\n\' | sed -n \'x; $p\'').stdout.slice(0, -1) as KeyHash

    if (contractAddress.length === 0) throw new Error('contract deploy failed')
    return Promise.resolve(updateContracts(registry, registry.contracts.set(name, contractAddress)))
  }
}

// Eventually you will be able to
// specify a different entry point.
function call (eztz: EZTZ): Client['call'] {
  return (
    registry: Registry,
    caller: Name,
    contract: Name,
    parameters: Sexp | null = null,
    amount: MuTez = 0 as MuTez
  ): Promise<CallResult> => {
    const callerKeys = registry.accounts.get(caller)
    const contractPKH = registry.contracts.get(contract)

    if (!callerKeys) throw Error('caller name ' + caller + ' not found')
    if (!contractPKH) throw Error('contract name ' + contract + ' not found')

    const tezAmount = eztz.utility.totez(amount)
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    return eztz.contract.send(contractPKH, callerKeys.pkh, callerKeys, tezAmount, parameters,
      0 as Tez, 100000, 0)
  }
}

function implicit (
  eztz: EZTZ,
  transferFn: (registry: Registry, from: Name, to: Name, amount: MuTez) => Promise<void>
): Client['implicit'] {
  return async (
    registry: Registry,
    name: Name,
    creator: Name,
    balance: MuTez
  ): Promise<Registry> => {
    const account = eztz.crypto.generateKeysNoSeed()
    if (registry.accounts.get(name)) throw Error('account name ' + name + ' already exists')
    if (registry.contracts.get(name)) throw Error('account name ' + name + ' shared by a contract')

    const newRegistry = updateAccounts(registry, registry.accounts.set(name, account))
    await transferFn(newRegistry, creator, name, balance)
    return newRegistry
  }
}

function transfer (eztz: EZTZ): Client['transfer'] {
  return (registry: Registry, from: Name, to: Name, amount: MuTez): Promise<void> => {
    const fromKeys = registry.accounts.get(from)
    const toPKH = findPKH(registry, to)

    if (!fromKeys) throw Error('from name ' + from + ' not found')
    if (!toPKH) throw Error('to name ' + to + ' not found')

    const tezAmount = eztz.utility.totez(amount)
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    return eztz.rpc.transfer(fromKeys.pkh, fromKeys, toPKH, tezAmount, 0 as Tez, null, 100000, 0)
  }
}

// TODO: Look into Tez unit differences.
function balance (eztz: EZTZ): Client['balance'] {
  return (registry: Registry, account: Name): Promise<MuTez> => {
    const keys = findPKH(registry, account)
    if (!keys) throw Error('account name ' + account + ' not found')
    return eztz.rpc.getBalance(keys).then(parseInt) as Promise<MuTez>
  }
}

function storage (eztz: EZTZ): Client['storage'] {
  return (registry: Registry, contract: Name): Promise<StorageResult> => {
    const contractPKH = registry.contracts.get(contract)
    if (!contractPKH) throw Error('contract name ' + contract + ' not found')
    return eztz.contract.storage(contractPKH)
  }
}

export function createClient (
  eztz: EZTZ,
  tezosClient: TezosClient
): Client {
  const transferFn = transfer(eztz)

  return {
    deploy: deploy(eztz, tezosClient),
    call: call(eztz),
    implicit: implicit(eztz, transferFn),
    transfer: transferFn,
    balance: balance(eztz),
    storage: storage(eztz)
  }
}
