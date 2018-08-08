/// <reference types="diff" />
import { ExecOutputReturnValue } from 'shelljs';
import { eztz } from 'eztz';
export declare type Address = string;
export declare type Account = eztz.Keys;
export declare type CallResult = eztz.contract.SendResult;
export interface Client {
    deploy(deployer: Account, contractFile: Path, storage: Sexp): Promise<KeyHash>;
    call(caller: Account, contract: KeyHash, parameters: Sexp | null, amount: number): Promise<CallResult>;
    account(originator: Account, balance: number): Promise<Account>;
    transfer(from: Account, to: Account, amount: number): Promise<void>;
    balance(account: Account): Promise<number>;
    storage(contract: KeyHash): Promise<StorageResult>;
}
export declare type Compiler = (contractPath: Path) => ExecOutputReturnValue;
export declare type Diff = JsDiff.IDiffResult[];
export declare type EZTZ = typeof eztz;
export declare type Key = eztz.Key;
export declare type KeyHash = eztz.KeyHash;
export declare type Path = string;
export declare type Sexp = string;
export declare type StorageResult = eztz.contract.StorageResult;
export declare type TestCmdParams = {
    generate: boolean;
    unit: boolean;
    integration: boolean;
};
export declare namespace Test {
    interface Account {
        name: string;
        balance: number;
    }
    interface Contract {
        name: string;
        file: Path;
        balance: number;
        storage: Sexp | object;
    }
    namespace Unit {
        interface State {
            storage: Sexp | object;
            balance: number;
            accounts: Account[];
        }
        interface Call {
            amount: number;
            caller: string;
            params: Sexp;
        }
    }
    interface Unit {
        name: string;
        initial: Unit.State;
        call: Unit.Call;
        expected: Unit.State;
    }
    namespace Integration {
        interface State {
            accounts: Account[];
            contracts: Contract[];
        }
        interface Call {
            amount: number;
            caller: string;
            contract: string;
            params: Sexp;
        }
    }
    interface Integration {
        initial: Integration.State;
        calls: Integration.Call[];
        expected: Integration.State;
    }
}
export declare type TezosClient = (command: string) => ExecOutputReturnValue;
