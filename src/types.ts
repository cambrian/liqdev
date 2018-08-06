import { eztz } from 'eztz'

export type Address = string
export type EZTZ = typeof eztz
export type Key = string
export type Path = string

export interface TestCaseData {
  name: string,
  initStorage: string,
  input: string,
  expectedStorage: object
}
