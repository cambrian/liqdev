import { Compiler, EZTZ, TestCmdParams } from './types';
/**
 * @param glob Matches contracts AND test files (leave out extension)
 */
export declare function test(compile: Compiler, eztz: EZTZ, { generate, unit, integration }: TestCmdParams, glob?: string): Promise<void>;
