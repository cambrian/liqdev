import { ExecOutputReturnValue } from 'shelljs';
import { Path } from './types';
export declare type Compiler = (contractPath: Path) => ExecOutputReturnValue;
export declare const createCompiler: (compilerPath: string) => Compiler;
export declare const startWatcher: (compile: Compiler) => import("chokidar").FSWatcher;
