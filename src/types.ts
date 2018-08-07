import { ExecOutputReturnValue } from 'shelljs'
import { eztz } from 'eztz'

export type Address = string
export type Compiler = (contractPath: Path) => ExecOutputReturnValue
export type EZTZ = typeof eztz
export type Key = string
export type Path = string

export interface TestCaseData {
  name: string,
  initStorage: string,
  input: string,
  expectedStorage: object
}
