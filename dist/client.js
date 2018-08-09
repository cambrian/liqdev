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
function deploy(tezosClient) {
    return async (registry, name, deployer, contractFile, storage, balance) => {
        const deployerAccount = registry.accounts.get(deployer);
        if (!deployerAccount)
            throw new Error('deployer name ' + deployerAccount + ' not found');
        clientAlias(tezosClient, deployerAccount, deployer); // TODO: Make this idempotent.
        // TODO: Make this less brittle, probably using EZTZ.
        const saltedName = name + '-' + now(); // Only for tezos-client internal use.
        const result = tezosClient('originate contract ' + saltedName + ' for ' + deployer +
            ' transferring ' + balance.toString() + ' from ' + deployer + ' running ' + contractFile +
            ' --init \'' + storage + '\' | grep \'New contract\' | tr \' \' \'\n\' | sed -n \'x; $p\'');
        const contractAddress = result.stdout.slice(0, -1);
        if (contractAddress.length === 0)
            throw new Error('contract deploy failed');
        return updateContracts(registry, registry.contracts.set(name, contractAddress));
    };
}
// Eventually you will be able to
// specify a different entry point.
function call(eztz) {
    return async (registry, caller, contract, parameters = null, amount = 0) => {
        const callerKeys = registry.accounts.get(caller);
        const contractPKH = registry.contracts.get(contract);
        if (!callerKeys)
            throw Error('caller name ' + caller + ' not found');
        if (!contractPKH)
            throw Error('contract name ' + contract + ' not found');
        // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
        return eztz.contract.send(contractPKH, callerKeys.pkh, callerKeys, amount, parameters, 0, 100000, 0);
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
        await transferFn(newRegistry, creator, name, balance);
        return newRegistry;
    };
}
function transfer(eztz) {
    return async (registry, from, to, amount) => {
        const fromKeys = registry.accounts.get(from);
        const toPKH = findPKH(registry, to);
        if (!fromKeys)
            throw Error('from name ' + from + ' not found');
        if (!toPKH)
            throw Error('to name ' + to + ' not found');
        // TODO: Make fee, gas, and storage limits configurable in a world where they matter.
        await eztz.rpc.transfer(fromKeys.pkh, fromKeys, toPKH, amount, 0, null, 100000, 0);
        return;
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
    return async (registry, contract) => {
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
        deploy: deploy(tezosClient),
        call: call(eztz),
        implicit: implicit(eztz, keyGen, transferFn),
        transfer: transferFn,
        balance: balance(eztz),
        storage: storage(eztz)
    };
}
exports.createClient = createClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUFnQztBQWlCaEMscUNBQWlDO0FBRWpDLFNBQVMsY0FBYyxDQUFFLFFBQWtCLEVBQUUsUUFBOEI7SUFDekUsT0FBTztRQUNMLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztLQUM5QixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFFLFFBQWtCLEVBQUUsU0FBK0I7SUFDM0UsT0FBTztRQUNMLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUMzQixTQUFTLEVBQUUsU0FBUztLQUNyQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFFLFFBQWtCLEVBQUUsSUFBVTtJQUM5QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMzQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxJQUFJLE9BQU87UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUE7SUFDL0IsSUFBSSxRQUFRO1FBQUUsT0FBTyxRQUFRLENBQUE7SUFDN0IsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUNsQixXQUF3QixFQUN4QixPQUFnQixFQUNoQixJQUFVO0lBRVYsT0FBTyxXQUFXLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQy9ELENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBRSxXQUF3QjtJQUN2QyxPQUFPLEtBQUssRUFDVixRQUFrQixFQUNsQixJQUFVLEVBQ1YsUUFBYyxFQUNkLFlBQWtCLEVBQ2xCLE9BQWEsRUFDYixPQUFlLEVBQ0ks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