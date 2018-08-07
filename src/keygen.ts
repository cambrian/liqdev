import { Account, EZTZ } from './types'

import { entropyToMnemonic } from 'bip39'

const pad32 = (n: number): string =>
  ('0'.repeat(32) + n.toString()).slice(-32)

// TODO (eventually): Change EZTZ to take seeds other than a mnemonic
// and passphrase combo, which will make this function less clunky.
function* generateKeysWithSeed (eztz: EZTZ, seed: number): IterableIterator<Account> {
  let counter: number = seed
  while (true) {
    yield eztz.crypto.generateKeys(entropyToMnemonic(pad32(counter)), '')
    counter += 1
  }
}

// Thin wrapper so we don't have to use
// the clunky next().value syntax with
// generators.
export class KeyGen {
  keysGen: IterableIterator<Account>
  constructor (eztz: EZTZ, seed: number) {
    this.keysGen = generateKeysWithSeed(eztz, seed)
  }

  public nextAccount (): Account {
    return this.keysGen.next().value
  }
}
