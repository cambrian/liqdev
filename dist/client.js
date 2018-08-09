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
    return tezosClient('add address ' + name + ' ' + account.pkh + ' --force');
}
function deploy(eztz, tezosClient) {
    return (registry, name, deployer, contractFile, storage, balance) => {
        const deployerAccount = registry.accounts.get(deployer);
        if (!deployerAccount)
            throw new Error('deployer name ' + deployerAccount + ' not found');
        let saltedDeployer = deployer;
        // TODO: Fix this special casing later if and when
        // we need to test deploys from other accounts.
        if (deployer.slice(0, 9) !== 'bootstrap') {
            const saltedDeployer = deployer + '-' + now(); // Only for tezos-client internal use.
            clientAlias(tezosClient, deployerAccount, saltedDeployer);
        }
        // TODO: Make this less brittle, probably using EZTZ.
        const tezBalance = eztz.utility.totez(balance);
        const saltedName = name + '-' + now(); // Only for tezos-client internal use.
        const contractAddress = tezosClient('originate contract ' + saltedName + ' for ' + saltedDeployer + ' transferring ' + tezBalance.toString() + ' from ' + saltedDeployer +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUFnQztBQWtCaEMscUNBQWlDO0FBRWpDLFNBQVMsY0FBYyxDQUFFLFFBQWtCLEVBQUUsUUFBOEI7SUFDekUsT0FBTztRQUNMLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztLQUM5QixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFFLFFBQWtCLEVBQUUsU0FBK0I7SUFDM0UsT0FBTztRQUNMLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUMzQixTQUFTLEVBQUUsU0FBUztLQUNyQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFFLFFBQWtCLEVBQUUsSUFBVTtJQUM5QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMzQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxJQUFJLE9BQU87UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUE7SUFDL0IsSUFBSSxRQUFRO1FBQUUsT0FBTyxRQUFRLENBQUE7SUFDN0IsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUNsQixXQUF3QixFQUN4QixPQUFnQixFQUNoQixJQUFVO0lBRVYsT0FBTyxXQUFXLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQTtBQUM1RSxDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUUsSUFBVSxFQUFFLFdBQXdCO0lBQ25ELE9BQU8sQ0FDTCxRQUFrQixFQUNsQixJQUFVLEVBQ1YsUUFBYyxFQUNkLFlBQWtCLEVBQ2xCLE9BQWEs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