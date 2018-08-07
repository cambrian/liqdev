import { ExecOutputReturnValue } from 'shelljs'
import { eztz } from 'eztz'

export type Address = string
export type Compiler = (contractPath: Path) => ExecOutputReturnValue
export type EZTZ = typeof eztz
export type Key = string
export type Path = string
export type Sexp = string

export interface TestCaseData {
  name: string,
  initialStorage: string,
  callParams: string,
  expectedStorage: object
}
