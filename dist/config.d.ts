import { Registry } from './types';
export declare const bootstrapAccount = "bootstrap1";
export declare const commandName = "liqdev";
export declare const compilerPath = "~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm";
export declare const tezosClientPath = "~/.liqdev/.tezos-client-path";
export declare const defaultProvider = "http://127.0.0.1:18731";
export declare const unitTestExtension = ".utest.json";
export declare const integrationTestExtension = ".itest.json";
export declare const clientWait = 0.25;
export declare const seed = 0;
export declare const bootstrapAccounts: {
    bootstrap1: {
        sk: string;
        pk: string;
        pkh: string;
    };
};
export declare const bootstrapRegistry: Registry;
export declare const setupPath: {
    local: string;
    global: string;
};
export declare const bakerPath: {
    local: string;
    global: string;
};
export declare const clientPath: {
    local: string;
    global: string;
};
export declare const killPath: {
    local: string;
    global: string;
};
export declare const deployPath: {
    local: string;
    global: string;
};
export declare const whichPath: {
    local: string;
    global: string;
};
