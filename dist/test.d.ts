import { Client, Compiler, TestCmdParams } from './types';
/**
 * @param globPattern Matches contracts AND test files (so leave out the extension when calling
 * this).
 */
export declare function test(compile: Compiler, client: Client, { generate, unit, integration }: TestCmdParams, globPattern?: string): Promise<void>;
