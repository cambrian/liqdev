"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        clientAlias(tezosClient, deployerAccount, deployer);
        const result = tezosClient('originate contract ' + name + ' for ' + deployer +
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
    return async (registry, account) => {
        const accountKeys = registry.accounts.get(account);
        if (!accountKeys)
            throw Error('account name ' + account + ' not found');
        return eztz.rpc.getBalance(accountKeys.pkh);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWlCQSxxQ0FBaUM7QUFFakMsU0FBUyxjQUFjLENBQUUsUUFBa0IsRUFBRSxRQUE4QjtJQUN6RSxPQUFPO1FBQ0wsUUFBUSxFQUFFLFFBQVE7UUFDbEIsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO0tBQzlCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUUsUUFBa0IsRUFBRSxTQUErQjtJQUMzRSxPQUFPO1FBQ0wsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO1FBQzNCLFNBQVMsRUFBRSxTQUFTO0tBQ3JCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUUsUUFBa0IsRUFBRSxJQUFVO0lBQzlDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzNDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLElBQUksT0FBTztRQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQTtJQUMvQixJQUFJLFFBQVE7UUFBRSxPQUFPLFFBQVEsQ0FBQTtJQUM3QixPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQ2xCLFdBQXdCLEVBQ3hCLE9BQWdCLEVBQ2hCLElBQVU7SUFFVixPQUFPLFdBQVcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDL0QsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFFLFdBQXdCO0lBQ3ZDLE9BQU8sS0FBSyxFQUNWLFFBQWtCLEVBQ2xCLElBQVUsRUFDVixRQUFjLEVBQ2QsWUFBa0IsRUFDbEIsT0FBYSxFQUNiLE9BQWUsRUFDSSxFQUFFO1FBQ3JCLE1B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