"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createDeployFn(tezosClient, keyGen) {
    return async (deployer, contractFile, storage) => Promise.reject('unimplemented');
}
// Eventually you will be able to
// specify a different entry point.
function createCallFn(eztz) {
    return async (caller, contract, parameters = null, amount = 0) => 
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    eztz.contract.send(contract, caller.pkh, caller, amount, parameters, 0, 100000, 0);
}
function createAccountFn(eztz, keyGen, transferFn) {
    return async (originator, balance) => {
        const account = keyGen.nextAccount();
        transferFn(originator, account, balance);
        return account;
    };
}
function createTransferFn(eztz) {
    return async (from, to, amount) => 
    // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
    eztz.rpc.transfer(from.pkh, from, to.pkh, amount, 0, null, 100000, 0).then(() => undefined);
}
function createBalanceFn(eztz) {
    return async (account) => eztz.rpc.getBalance(account.pkh);
}
function createStorageFn(eztz) {
    return async (contract) => eztz.contract.storage(contract);
}
function createClient(eztz, tezosClient, keyGen) {
    const transferFn = createTransferFn(eztz);
    return {
        deploy: createDeployFn(tezosClient, keyGen),
        call: createCallFn(eztz),
        account: createAccountFn(eztz, keyGen, transferFn),
        transfer: transferFn,
        balance: createBalanceFn(eztz),
        storage: createStorageFn(eztz)
    };
}
exports.createClient = createClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVBLFNBQVMsY0FBYyxDQUFFLFdBQXdCLEVBQUUsTUFBYztJQUMvRCxPQUFPLEtBQUssRUFBRSxRQUFpQixFQUFFLFlBQWtCLEVBQUUsT0FBYSxFQUFvQixFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUMxSCxDQUFDO0FBRUQsaUNBQWlDO0FBQ2pDLG1DQUFtQztBQUNuQyxTQUFTLFlBQVksQ0FBRSxJQUFVO0lBQy9CLE9BQU8sS0FBSyxFQUNWLE1BQWUsRUFDZixRQUFpQixFQUNqQixhQUEwQixJQUFJLEVBQzlCLFNBQWlCLENBQUMsRUFDRyxFQUFFO0lBQ3ZCLHFGQUFxRjtJQUNyRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3RGLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FDdEIsSUFBVSxFQUNWLE1BQWMsRUFDZCxVQUF5RTtJQUV6RSxPQUFPLEtBQUssRUFBRSxVQUFtQixFQUFFLE9BQWUsRUFBb0IsRUFBRTtRQUN0RSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDcEMsVUFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDeEMsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUUsSUFBVTtJQUNuQyxPQUFPLEtBQUssRUFBRSxJQUFhLEVBQUUsRUFBVyxFQUFFLE1BQWMsRUFBaUIsRUFBRTtJQUN6RSxxRkFBcUY7SUFDckYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9GLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBRSxJQUFVO0lBQ2xDLE9BQU8sS0FBSyxFQUFFLE9BQWdCLEVBQW1CLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEYsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFFLElBQVU7SUFDbEMsT0FBTyxLQUFLLEVBQUUsUUFBaUIsRUFBMEIsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzdGLENBQUM7QUFFRCxTQUFnQixZQUFZLENBQUUsSUFBVSxFQUFFLFdBQXdCLEVBQUUsTUFBYztJQUNoRixNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN6QyxPQUFPO1FBQ0wsTUFBTSxFQUFFLGNBQWMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO1FBQzNDLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDO1FBQ3hCLE9BQU8sRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUM7UUFDbEQsUUFBUSxFQUFFLFVBQVU7UUFDcEIsT0FBTyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUM7UUFDOUIsT0FBTyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUM7S0FDL0IsQ0FBQTtBQUNILENBQUM7QUFWRCxvQ0FVQyJ9