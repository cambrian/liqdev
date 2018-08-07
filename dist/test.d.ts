import * as eztz from 'eztz';
import { Compiler } from './types';
export declare const test: (compile: Compiler, eztz: typeof eztz.eztz, contractGlob: string, { generate }: {
    generate: boolean;
}) => Promise<void>;
