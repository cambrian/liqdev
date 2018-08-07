import { Compiler } from './types';
export declare const createCompiler: (compilerPath: string) => Compiler;
export declare const startWatcher: (compile: Compiler) => import("chokidar").FSWatcher;
