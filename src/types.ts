import { ExecOutputReturnValue } from 'shelljs'
import { Map } from 'immutable'
import { eztz } from 'eztz'

export type Account = eztz.Keys

export type CallResult = eztz.contract.SendResult // TODO: See eztz.d.ts.

export interface Client {
  deploy (
    registry: Registry,
    name: Name,
    deployer: Name,
    contractFile: Path,
    storage: Sexp
  ): Promise<Registry>
  call (
    registry: Registry,
    caller: Name,
    contract: Name,
    parameters: Sexp | null,
    amount: number
  ): Promise<CallResult>
  implicit (registry: Registry, name: Name, creator: Name, balance: number): Promise<Registry>
  // originate (registry: Registry, name: Name, originator: Name, balance: number): Promise<Registry>
  transfer (registry: Registry, from: Name, to: Name, amount: number): Promise<void>
  balance (registry: Registry, account: Name): Promise<number>
  storage (registry: Registry, contract: Name): Promise<StorageResult>
}

export type Compiler = (contractPath: Path) => ExecOutputReturnValue

export type Diff = JsDiff.IDiffResult[]

export type EZTZ = typeof eztz

export type Key = eztz.Key

export type KeyHash = eztz.KeyHash

export type Name = string // Type for name on the Tezos blockchain for accounts and contracts.

export type Path = string

export interface Registry {
  accounts: Map<Name, Account>
  contracts: Map<Name, KeyHash>
}

export type Sexp = string

export type StorageResult = eztz.contract.StorageResult

export type TestCmdParams = {
  generate: boolean,
  unit: boolean,
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
    storage: Sexp | object
  }

  export namespace Unit {
    export interface State {
      storage: Sexp | object
      balance: number
      accounts: Account[]
    }

    export interface Call {
      amount: Name
      caller: string
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

export type TezosClient = (command: string) => ExecOutputReturnValue
