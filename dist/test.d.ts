import { Compiler, EZTZ, TestCmdParams } from './types';
export declare function test(compile: Compiler, eztz: EZTZ, { glob, generate, unit, integration }: TestCmdParams): Promise<void>;
