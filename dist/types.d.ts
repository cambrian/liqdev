import { ExecOutputReturnValue } from 'shelljs';
import { eztz } from 'eztz';
export declare type Address = string;
export declare type Compiler = (contractPath: Path) => ExecOutputReturnValue;
export declare type EZTZ = typeof eztz;
export declare type Key = string;
export declare type Path = string;
export declare type Sexp = string;
export interface TestCaseData {
    name: string;
    initialStorage: string;
    callParams: string;
    expectedStorage: object;
}
