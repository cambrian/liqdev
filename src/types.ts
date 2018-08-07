import { ExecOutputReturnValue } from 'shelljs'
import { eztz } from 'eztz'

export type Address = string
export import Account = eztz.crypto.Keys
export type CallResult = object // TODO: Flesh this type out by example.
export type Compiler = (contractPath: Path) => ExecOutputReturnValue
export type EZTZ = typeof eztz
export import Key = eztz.crypto.Key
export import KeyHash = eztz.crypto.KeyHash
export type Path = string
export type Sexp = string

export interface TestCaseData {
  name: string,
  initialStorage: string,
  callParams: string,
  expectedStorage: object
}
