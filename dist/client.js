"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const now = require("nano-time");
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
    return tezosClient('add address ' + name + ' ' + account.pkh + ' --force');
}
// Make unique names so successive tests don't stomp on each other.
function uniqueName(name) {
    return name + '-' + now();
}
function deploy(eztz, tezosClient) {
    return (registry, name, deployer, contractFile, storage, balance) => {
        const deployerAccount = registry.accounts.get(deployer);
        if (!deployerAccount)
            throw new Error('deployer name ' + deployerAccount + ' not found');
        // TODO: Fix this special casing later if and when
        // we need to test deploys from other accounts.
        if (deployer.slice(0, 9) !== 'bootstrap') {
            deployer = uniqueName(deployer);
            clientAlias(tezosClient, deployerAccount, deployer);
        }
        // TODO: Make this less brittle, probably using EZTZ.
        const tezBalance = eztz.utility.totez(balance);
        const contractAddress = tezosClient('originate contract ' + uniqueName(name) + ' for ' + deployer + ' transferring ' + tezBalance.toString() + ' from ' + deployer +
            ' running ' + contractFile + ' --init \'' + storage + '\' | grep \'New contract\' | ' +
            'tr \' \' \'\n\' | sed -n \'x; $p\'').stdout.slice(0, -1);
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
function implicit(eztz, transferFn) {
    return async (registry, name, creator, balance) => {
        const account = eztz.crypto.generateKeysNoSeed();
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
        return eztz.rpc.getBalance(keys).then(parseInt);
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
function createClient(eztz, tezosClient) {
    const transferFn = transfer(eztz);
    return {
        deploy: deploy(eztz, tezosClient),
        call: call(eztz),
        implicit: implicit(eztz, transferFn),
        transfer: transferFn,
        balance: balance(eztz),
        storage: storage(eztz)
    };
}
exports.createClient = createClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUFnQztBQW1CaEMsU0FBUyxjQUFjLENBQUUsUUFBa0IsRUFBRSxRQUE4QjtJQUN6RSxPQUFPO1FBQ0wsUUFBUSxFQUFFLFFBQVE7UUFDbEIsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO0tBQzlCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUUsUUFBa0IsRUFBRSxTQUErQjtJQUMzRSxPQUFPO1FBQ0wsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO1FBQzNCLFNBQVMsRUFBRSxTQUFTO0tBQ3JCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUUsUUFBa0IsRUFBRSxJQUFVO0lBQzlDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzNDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLElBQUksT0FBTztRQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQTtJQUMvQixJQUFJLFFBQVE7UUFBRSxPQUFPLFFBQVEsQ0FBQTtJQUM3QixPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQ2xCLFdBQXdCLEVBQ3hCLE9BQWdCLEVBQ2hCLElBQVU7SUFFVixPQUFPLFdBQVcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFBO0FBQzVFLENBQUM7QUFFRCxtRUFBbUU7QUFDbkUsU0FBUyxVQUFVLENBQUUsSUFBWTtJQUMvQixPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFVLENBQUE7QUFDbkMsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFF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