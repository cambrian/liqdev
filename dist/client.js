"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function deploy(eztz, keyGen, deployer, contractFile, storage) {
    return Promise.reject('unimplemented');
}
<<<<<<< HEAD
exports.deploy = deploy;
// Eventually you will be able to
// specify a different entry point.
async function call(eztz, caller, contract, parameters = null, amount = 0) {
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    return eztz.contract.send(contract, caller.pkh, caller, amount, parameters, 0, 100000, 0);
}
exports.call = call;
async function account(eztz, keyGen, originator, balance) {
    const account = keyGen.nextAccount();
    transfer(eztz, originator, account, balance);
    return account;
}
exports.account = account;
async function transfer(eztz, from, to, amount) {
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    return eztz.rpc.transfer(from.pkh, from, to.pkh, amount, 0, null, 100000, 0)
        .then(() => undefined);
}
exports.transfer = transfer;
async function balance(eztz, account) {
    return eztz.rpc.getBalance(account.pkh);
}
exports.balance = balance;
async function storage(eztz, contract) {
    return eztz.contract.storage(contract);
}
exports.storage = storage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlPLEtBQUssVUFBVSxNQUFNLENBQzFCLElBQVUsRUFDVixNQUFjLEVBQ2QsUUFBaUIsRUFDakIsWUFBa0IsRUFDbEIsT0FBYTtJQUViLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN4QyxDQUFDO0FBUkQsd0JBUUM7QUFFRCxpQ0FBaUM7QUFDakMsbUNBQW1DO0FBQzVCLEtBQUssVUFBVSxJQUFJLENBQ3hCLElBQVUsRUFDVixNQUFlLEVBQ2YsUUFBaUIsRUFDakIsYUFBMEIsSUFBSSxFQUM5QixTQUFpQixDQUFDO0lBRWxCLHFGQUFxRjtJQUNyRixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDM0YsQ0FBQztBQVRELG9CQVNDO0FBRU0sS0FBSyxVQUFVLE9BQU8sQ0FDM0IsSUFBVSxFQUNWLE1BQWMsRUFDZCxVQUFtQixFQUNuQixPQUFlO0lBRWYsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUM1QyxPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBVEQsMEJBU0M7QUFFTSxLQUFLLFVBQVUsUUFBUSxDQUM1QixJQUFVLEVBQ1YsSUFBYSxFQUNiLEVBQVcsRUFDWCxNQUFjO0lBRWQscUZBQXFGO0lBQ3JGLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3pFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUMxQixDQUFDO0FBVEQsNEJBU0M7QUFFTSxLQUFLLFVBQVUsT0FBTyxDQUFFLElBQVUsRUFBRSxPQUFnQjtJQUN6RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN6QyxDQUFDO0FBRkQsMEJBRUM7QUFFTSxLQUFLLFVBQVUsT0FBTyxDQUFFLElBQVUsRUFBRSxRQUFpQjtJQUMxRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3hDLENBQUM7QUFGRCwwQkFFQyJ9
=======
// Eventually you will be able to specify a different entry point.
async function call(eztz, keyGen, contract, parameters) {
    return Promise.reject('unimplemented');
}
async function originate(eztz, keyGen, originator, balance) {
    return Promise.reject('unimplemented');
}
async function transfer(eztz, keyGen, from, to, amount) {
    return Promise.reject('unimplemented');
}
async function balance(eztz, keyGen, account) {
    return Promise.reject('unimplemented');
}
// TODO: Update any after pull.
async function storage(eztz, keyGen, contract) {
    return Promise.reject('unimplemented');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLEtBQUssVUFBVSxNQUFNLENBQ25CLElBQVUsRUFDVixNQUFjLEVBQ2QsUUFBaUIsRUFDakIsWUFBa0IsRUFDbEIsT0FBYTtJQUViLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN4QyxDQUFDO0FBRUQsa0VBQWtFO0FBQ2xFLEtBQUssVUFBVSxJQUFJLENBQUUsSUFBVSxFQUFFLE1BQWMsRUFBRSxRQUFpQixFQUFFLFVBQWdCO0lBQ2xGLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN4QyxDQUFDO0FBRUQsS0FBSyxVQUFVLFNBQVMsQ0FDdEIsSUFBVSxFQUNWLE1BQWMsRUFDZCxVQUFtQixFQUNuQixPQUFlO0lBRWYsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3hDLENBQUM7QUFFRCxLQUFLLFVBQVUsUUFBUSxDQUNyQixJQUFVLEVBQ1YsTUFBYyxFQUNkLElBQWEsRUFDYixFQUFXLEVBQ1gsTUFBYztJQUVkLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN4QyxDQUFDO0FBRUQsS0FBSyxVQUFVLE9BQU8sQ0FBRSxJQUFVLEVBQUUsTUFBYyxFQUFFLE9BQWdCO0lBQ2xFLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN4QyxDQUFDO0FBRUQsK0JBQStCO0FBQy9CLEtBQUssVUFBVSxPQUFPLENBQUUsSUFBVSxFQUFFLE1BQWMsRUFBRSxRQUFpQjtJQUNuRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDeEMsQ0FBQyJ9
>>>>>>> 27240027dcf375418c7b1f72b4b3eaee48fb188a
