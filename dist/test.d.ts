import { Compiler, EZTZ, TestCmdParams } from './types';
/**
<<<<<<< HEAD
 * @param glob Matches contracts AND test files (leave out extension)
=======
 * @param glob Matches contracts AND test files (so leave out the extension when calling this)
>>>>>>> 27240027dcf375418c7b1f72b4b3eaee48fb188a
 */
export declare function test(compile: Compiler, eztz: EZTZ, { generate, unit, integration }: TestCmdParams, glob?: string): Promise<void>;
