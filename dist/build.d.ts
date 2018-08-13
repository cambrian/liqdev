import { Compiler, Path } from './types';
import { FSWatcher } from 'chokidar';
export declare function createCompiler(compilerPath: Path): Compiler;
export declare function startWatcher(compile: Compiler, glob?: string): FSWatcher;
