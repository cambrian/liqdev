import { Client, EZTZ, TezosClient } from './types';
export declare function createClient(eztz: EZTZ, tezosClient: TezosClient, { seed }?: {
    seed: number;
}): Client;
