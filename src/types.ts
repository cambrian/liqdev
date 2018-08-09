import * as I from 'immutable'

import { ExecOutputReturnValue } from 'shelljs'
import { eztz } from 'eztz'

class Nominal<T extends string> {
  // @ts-ignore
  private as: T
}

export type Account = eztz.Keys

export type CallResult = eztz.contract.SendResult // TODO: See eztz.d.ts.

export interface Client {
  deploy (
    registry: Registry,
    name: Name,
    deployer: Name,
    contractFile: Path,
    storage: Sexp,
    balance: MuTez
  ): Promise<Registry>

  call (
    registry: Registry,
    caller: Name,
    contract: Name,
    parameters: Sexp,
    amount: MuTez
  ): Promise<CallResult>

  implicit (registry: Registry, name: Name, creator: Name, balance: MuTez): Promise<Registry>

  // originate (
  //   registry: Registry,
  //   name: Name,
  //   originator: Name,
  //   balance: number
  // ): Promise<Registry>

  transfer (registry: Registry, from: Name, to: Name, amount: MuTez): Promise<void>

  balance (registry: Registry, account: Name): Promise<number>

  storage (registry: Registry, contract: Name): Promise<StorageResult>
}

export type Compiler = ((contractPath: Path) => ExecOutputReturnValue) & Nominal<'Compiler'>

export type Diff = JsDiff.IDiffResult[] & Nominal<'Diff'>

export type EZTZ = typeof eztz

export type Key = eztz.Key

export type KeyHash = eztz.KeyHash

export type MuTez = eztz.MuTez

// Type for name on the Tezos blockchain for accounts and contracts.
export type Name = string & Nominal<'Name'>

export type Path = string & Nominal<'Path'>

export interface Registry {
  accounts: I.Map<Name, Account>
  contracts: I.Map<Name, KeyHash>
}

export type Sexp = string & Nominal<'Sexp'>

export type StorageResult = eztz.contract.StorageResult

export interface TestCmdParams {
  generate: boolean
  unit: boolean
  integration: boolean
}

export namespace Test {
  // TODO: type Account = Implicit | Originated
  export interface Account {
    name: Name
    balance: number
  }

  export interface Contract {
    name: Name
    file: Path
    balance: number
    storage: Sexp | object // is a sexp in inital, object in [expected]
  }

  export namespace Unit {
    export interface State {
      storage: Sexp | object // is a sexp in inital, object in [expected]
      balance: number
      accounts: Account[]
    }

    export interface Call {
      amount: number
      caller: Name
      params: Sexp
    }
  }

  export interface Unit {
    name: string // Multiple unit tests per file, so they need a [name] field.
    initial: Unit.State
    call: Unit.Call
    expected: Unit.State
  }

  export namespace Integration {
    export interface State {
      accounts: Account[]
      contracts: Contract[]
    }

    export interface Call {
      amount: number
      caller: Name
      contract: Name
      params: Sexp
    }
  }

  export interface Integration {
    initial: Integration.State
    calls: Integration.Call[]
    expected: Integration.State
  }
}

export type Tez = eztz.Tez

export type TezosClient = ((command: string) => ExecOutputReturnValue) & Nominal<'TezosClient'>
