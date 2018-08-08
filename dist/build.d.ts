import { Compiler, Path } from './types';
export declare function createCompiler(compilerPath: Path): Compiler;
export declare function startWatcher(compile: Compiler): import("chokidar").FSWatcher;
