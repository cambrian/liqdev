"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bip39_1 = require("bip39");
const pad32 = (n) => ('0'.repeat(32) + n.toString()).slice(-32);
// TODO (eventually): Change EZTZ to take seeds other than a mnemonic
// and passphrase combo, which will make this function less clunky.
function* generateKeysWithSeed(eztz, seed) {
    let counter = seed;
    while (true) {
        yield eztz.crypto.generateKeys(bip39_1.entropyToMnemonic(pad32(counter)), '');
        counter += 1;
    }
}
// Thin wrapper so we don't have to use
// the clunky next().value syntax with
// generators.
class KeyGen {
    constructor(eztz, seed) {
        this.keysGen = generateKeysWithSeed(eztz, seed);
    }
    nextAccount() {
        return this.keysGen.next().value;
    }
}
exports.KeyGen = KeyGen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Z2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2tleWdlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLGlDQUF5QztBQUV6QyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBVSxFQUFFLENBQ2xDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUU1QyxxRUFBcUU7QUFDckUsbUVBQW1FO0FBQ25FLFFBQVEsQ0FBQyxDQUFDLG9CQUFvQixDQUFFLElBQVUsRUFBRSxJQUFZO0lBQ3RELElBQUksT0FBTyxHQUFXLElBQUksQ0FBQTtJQUMxQixPQUFPLElBQUksRUFBRTtRQUNYLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMseUJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDckUsT0FBTyxJQUFJLENBQUMsQ0FBQTtLQUNiO0FBQ0gsQ0FBQztBQUVELHVDQUF1QztBQUN2QyxzQ0FBc0M7QUFDdEMsY0FBYztBQUNkLE1BQWEsTUFBTTtJQUVqQixZQUFhLElBQVUsRUFBRSxJQUFZO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFFTSxXQUFXO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUE7SUFDbEMsQ0FBQztDQUNGO0FBVEQsd0JBU0MifQ==