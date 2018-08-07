/** Stub declaration file for EZTZ. TODO: Fill in completely. */

declare module 'eztz' {
  namespace eztz {
    // namespace contract
    // namespace rpc

    namespace crypto {
      type Key = string
      type KeyHash = string
      interface Keys {
        sk?: Key
        pk?: Key
        pkh: KeyHash
      }

      const generateKeys: (mnemonic: string, passphrase: string) => Keys
    }

    namespace node {
      const setProvider: (provider: string) => void
    }
  }
}
