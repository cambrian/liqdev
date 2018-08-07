import { ExecOutputReturnValue } from 'shelljs'
import { eztz } from 'eztz'

export type Address = string
export import Account = eztz.crypto.Keys
export type CallResult = object // TODO: Flesh this type out by example.
export type Compiler = (contractPath: Path) => ExecOutputReturnValue
export type Diff = JsDiff.IDiffResult[]
export type EZTZ = typeof eztz
export import Key = eztz.crypto.Key
export import KeyHash = eztz.crypto.KeyHash
export type Path = string
export type Sexp = string
export type TestCmdParams = {
  generate: boolean,
  unit: boolean,
  integration: boolean
}

export namespace Test {
  export interface Account {
    name: string
    balance: number
  }

  export interface Contract {
    name: string
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
      amount: number
      caller: string
      params: Sexp
    }
  }
  export interface Unit {
    name: string // Multiple unit tests per file, so they need a [name] field
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
      caller: string
      contract: string
      params: Sexp
    }
  }
  export interface Integration {
    initial: Integration.State
    calls: Integration.Call[]
    expected: Integration.State
  }
}
