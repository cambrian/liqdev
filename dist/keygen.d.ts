import { Account, EZTZ } from './types';
export declare class KeyGen {
    keysGen: IterableIterator<Account>;
    constructor(eztz: EZTZ, seed: number);
    nextAccount(): Account;
}
