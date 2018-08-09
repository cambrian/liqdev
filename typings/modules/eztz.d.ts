/** Stub declaration file for EZTZ. TODO: Fill in completely. */

declare module 'eztz' {
  class Nominal<T extends string> {
    // @ts-ignore
    private as: T
  }

  namespace eztz {
    type Tez = number & Nominal<'Tez'>
    type MuTez = number & Nominal<'MuTez'>

    type Key = string & Nominal<'Key'>
    type KeyHash = string & Nominal<'KeyHash'>
    interface Keys {
      sk?: Key
      pk?: Key
      pkh: KeyHash
    }

    namespace contract {
      // TODO: Flesh this type out.
      type SendResult = object & Nominal<'SendResult'>
      type StorageResult = object & Nominal<'StorageResult'>
      const send: (
        contract: KeyHash,
        fromPKH: KeyHash,
        keys: Keys,
        amount: number,
        parameter: string | null,
        fee: number,
        gasLimit?: number,
        storageLimit?: number
      ) => Promise<SendResult>
      const storage: (contract: KeyHash) => Promise<StorageResult>
    }

    namespace crypto {
      const extractKeys: (sk: Key) => Keys
      const generateKeys: (mnemonic: string, passphrase: string) => Keys
      const generateKeysNoSeed: () => Keys
    }

    namespace node {
      const setProvider: (provider: string) => void
    }

    namespace rpc {
      const getBalance: (address: KeyHash) => Promise<string>
      const transfer: (
        from: KeyHash,
        keys: Keys,
        to: KeyHash,
        amount: number,
        fee: number,
        parameter: string | null,
        gasLimit: number,
        storageLimit: number
      ) => Promise<void>
    }

    namespace utility {
      const totez: (amount: MuTez) => Tez
    }
  }
}
