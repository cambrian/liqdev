import { Compiler, EZTZ, TestCmdParams } from './types';
/**
 * @param glob Matches contracts AND test files (so leave out the extension when calling this)
 */
export declare function test(compile: Compiler, eztz: EZTZ, { generate, unit, integration }: TestCmdParams, glob?: string): Promise<void>;
