import { Account, CallResult, EZTZ, KeyHash, Path, Sexp, StorageResult } from './types';
import { KeyGen } from './keygen';
export declare function deploy(eztz: EZTZ, keyGen: KeyGen, deployer: Account, contractFile: Path, storage: Sexp): Promise<KeyHash>;
export declare function call(eztz: EZTZ, caller: Account, contract: KeyHash, parameters?: Sexp | null, amount?: number): Promise<CallResult>;
export declare function account(eztz: EZTZ, keyGen: KeyGen, originator: Account, balance: number): Promise<Account>;
export declare function transfer(eztz: EZTZ, from: Account, to: Account, amount: number): Promise<void>;
export declare function balance(eztz: EZTZ, account: Account): Promise<number>;
export declare function storage(eztz: EZTZ, contract: KeyHash): Promise<StorageResult>;
