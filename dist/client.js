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
        const contractAddress = tezosClient('originate contract ' + uniqueName(name) + ' for ' +
            deployer + ' transferring ' + tezBalance.toString() + ' from ' + deployer + ' running ' +
            contractFile + ' --init \'' + storage + '\' | grep \'New contract\' | ' +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUFnQztBQW9CaEMsU0FBUyxjQUFjLENBQUUsUUFBa0IsRUFBRSxRQUE4QjtJQUN6RSxPQUFPO1FBQ0wsUUFBUSxFQUFFLFFBQVE7UUFDbEIsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO0tBQzlCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUUsUUFBa0IsRUFBRSxTQUErQjtJQUMzRSxPQUFPO1FBQ0wsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO1FBQzNCLFNBQVMsRUFBRSxTQUFTO0tBQ3JCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUUsUUFBa0IsRUFBRSxJQUFVO0lBQzlDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzNDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdDLElBQUksT0FBTztRQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQTtJQUMvQixJQUFJLFFBQVE7UUFBRSxPQUFPLFFBQVEsQ0FBQTtJQUM3QixPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQ2xCLFdBQXdCLEVBQ3hCLE9BQWdCLEVBQ2hCLElBQVU7SUFFVixPQUFPLFdBQVcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFBO0FBQzVFLENBQUM7QUFFRCxtRUFBbUU7QUFDbkUsU0FBUyxVQUFVLENBQUUsSUFBWTtJQUMvQixPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFVLENBQUE7QUFDbkMsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFF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