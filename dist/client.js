"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const now = require("nano-time");
const keygen_1 = require("./keygen");
function updateAccounts(registry, accounts) {
    return {
        accounts: accounts,
        contracts: registry.contracts
    };
}
function updateContracts(registry, contracts) {
    return {
        accounts: registry.accounts,
        contracts: contracts
    };
}
function findPKH(registry, name) {
    const account = registry.accounts.get(name);
    const contract = registry.contracts.get(name);
    if (account)
        return account.pkh;
    if (contract)
        return contract;
    return undefined;
}
function clientAlias(tezosClient, account, name) {
    return tezosClient('add address ' + name + ' ' + account.pkh);
}
function deploy(eztz, tezosClient) {
    return (registry, name, deployer, contractFile, storage, balance) => {
        const deployerAccount = registry.accounts.get(deployer);
        if (!deployerAccount)
            throw new Error('deployer name ' + deployerAccount + ' not found');
        const saltedDeployer = deployer + '-' + now(); // Only for tezos-client internal use.
        clientAlias(tezosClient, deployerAccount, saltedDeployer);
        // TODO: Make this less brittle, probably using EZTZ.
        const tezBalance = eztz.utility.totez(balance);
        const saltedName = name + '-' + now(); // Only for tezos-client internal use.
        const contractAddress = tezosClient('originate contract ' + saltedName + ' for ' + saltedDeployer + ' transferring ' + tezBalance.toString() + ' from ' + saltedDeployer +
            ' running ' + contractFile + ' --init \'' + storage + '\' | grep \'New contract\' | ' +
            'tr \' \' \'\n\' | sed - n \'x; $p\'').stdout.slice(0, -1);
        if (contractAddress.length === 0)
            throw new Error('contract deploy failed');
        return Promise.resolve(updateContracts(registry, registry.contracts.set(name, contractAddress)));
    };
}
// Eventually you will be able to
// specify a different entry point.
function call(eztz) {
    return (registry, caller, contract, parameters = null, amount = 0) => {
        const callerKeys = registry.accounts.get(caller);
        const contractPKH = registry.contracts.get(contract);
        if (!callerKeys)
            throw Error('caller name ' + caller + ' not found');
        if (!contractPKH)
            throw Error('contract name ' + contract + ' not found');
        const tezAmount = eztz.utility.totez(amount);
        // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
        return eztz.contract.send(contractPKH, callerKeys.pkh, callerKeys, tezAmount, parameters, 0, 100000, 0);
    };
}
function implicit(eztz, keyGen, transferFn) {
    return async (registry, name, creator, balance) => {
        const account = keyGen.nextAccount();
        if (registry.accounts.get(name))
            throw Error('account name ' + name + ' already exists');
        if (registry.contracts.get(name))
            throw Error('account name ' + name + ' shared by a contract');
        const newRegistry = updateAccounts(registry, registry.accounts.set(name, account));
        const tezBalance = eztz.utility.totez(balance);
        await transferFn(newRegistry, creator, name, tezBalance);
        return newRegistry;
    };
}
function transfer(eztz) {
    return (registry, from, to, amount) => {
        const fromKeys = registry.accounts.get(from);
        const toPKH = findPKH(registry, to);
        if (!fromKeys)
            throw Error('from name ' + from + ' not found');
        if (!toPKH)
            throw Error('to name ' + to + ' not found');
        const tezAmount = eztz.utility.totez(amount);
        // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
        return eztz.rpc.transfer(fromKeys.pkh, fromKeys, toPKH, tezAmount, 0, null, 100000, 0);
    };
}
// TODO: Look into Tez unit differences.
function balance(eztz) {
    return (registry, account) => {
        const keys = findPKH(registry, account);
        if (!keys)
            throw Error('account name ' + account + ' not found');
        return eztz.rpc.getBalance(keys);
    };
}
function storage(eztz) {
    return (registry, contract) => {
        const contractPKH = registry.contracts.get(contract);
        if (!contractPKH)
            throw Error('contract name ' + contract + ' not found');
        return eztz.contract.storage(contractPKH);
    };
}
function createClient(eztz, tezosClient, { seed } = { seed: 0 }) {
    const transferFn = transfer(eztz);
    const keyGen = new keygen_1.KeyGen(eztz, seed);
    return {
        deploy: deploy(eztz, tezosClient),
        call: call(eztz),
        implicit: implicit(eztz, keyGen, transferFn),
        transfer: transferFn,
        balance: balance(eztz),
        storage: storage(eztz)
    };
}
exports.createClient = createClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUFnQztBQWtCaEMscUNBQWlDO0FBRWpDLFNBQVMsY0FBYyxDQUFFLFFBQWtCLEVBQUUsUUFBOEI7SUFDekUsT0FBTztRQUNMLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztLQUM5QixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFFLFFBQWtCLEVBQUUsU0FBK0I7SUFDM0UsT0FBTztRQUNMLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUMzQixTQUFTLEVBQUUsU0FBUztLQUNyQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFFLFFBQWtCLEVBQUUsSUFBVTtJQUM5QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMzQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxJQUFJLE9BQU87UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUE7SUFDL0IsSUFBSSxRQUFRO1FBQUUsT0FBTyxRQUFRLENBQUE7SUFDN0IsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUNsQixXQUF3QixFQUN4QixPQUFnQixFQUNoQixJQUFVO0lBRVYsT0FBTyxXQUFXLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQy9ELENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBRSxJQUFVLEVBQUUsV0FBd0I7SUFDbkQsT0FBTyxDQUNMLFFBQWtCLEVBQ2xCLElBQVUsRUFDVixRQUFjLEVBQ2QsWUFBa0IsRUFDbEIsT0FBYSxFQUNiLE9BQWMs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