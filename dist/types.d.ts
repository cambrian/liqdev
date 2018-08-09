/// <reference types="diff" />
import * as I from 'immutable';
import { ExecOutputReturnValue } from 'shelljs';
import { eztz } from 'eztz';
export declare type Account = eztz.Keys;
export declare type CallResult = eztz.contract.SendResult;
export interface Client {
    deploy(registry: Registry, name: Name, deployer: Name, contractFile: Path, storage: Sexp, balance: MuTez): Promise<Registry>;
    call(registry: Registry, caller: Name, contract: Name, parameters: Sexp, amount: MuTez): Promise<CallResult>;
    implicit(registry: Registry, name: Name, creator: Name, balance: MuTez): Promise<Registry>;
    transfer(registry: Registry, from: Name, to: Name, amount: MuTez): Promise<void>;
    balance(registry: Registry, account: Name): Promise<number>;
    storage(registry: Registry, contract: Name): Promise<StorageResult>;
}
export declare type Compiler = (contractPath: Path) => ExecOutputReturnValue;
export declare type Diff = JsDiff.IDiffResult[];
export declare type EZTZ = typeof eztz;
export declare type Key = eztz.Key;
export declare type KeyHash = eztz.KeyHash;
export declare type MuTez = eztz.MuTez;
export declare type Name = string;
export declare type Path = string;
export interface Registry {
    accounts: I.Map<Name, Account>;
    contracts: I.Map<Name, KeyHash>;
}
export declare type Sexp = string;
export declare type StorageResult = eztz.contract.StorageResult;
export declare type TestCmdParams = {
    generate: boolean;
    unit: boolean;
    integration: boolean;
};
export declare namespace Test {
    interface Account {
        name: Name;
        balance: number;
    }
    interface Contract {
        name: Name;
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
            caller: Name;
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
            caller: Name;
            contract: Name;
            params: Sexp;
        }
    }
    interface Integration {
        initial: Integration.State;
        calls: Integration.Call[];
        expected: Integration.State;
    }
}
export declare type Tez = eztz.Tez;
export declare type TezosClient = (command: string) => ExecOutputReturnValue;
