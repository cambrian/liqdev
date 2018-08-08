import { Client, EZTZ, TezosClient } from './types';
import { KeyGen } from './keygen';
export declare function createClient(eztz: EZTZ, tezosClient: TezosClient, keyGen: KeyGen): Client;
