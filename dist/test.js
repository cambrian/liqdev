"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mocha = require("mocha");
const _ = require("lodash");
const colors = require("colors");
const config = require("./config");
const fs = require("fs-extra");
const glob = require("glob-promise");
const path = require("path");
const readline = require("readline");
const diff_1 = require("diff");
// Sketchy workaround because diffJson TypeErrors
// if either input is undefined.
function diffJson(a, b, { replaceUndefinedWithNull } = { replaceUndefinedWithNull: true }) {
    if (replaceUndefinedWithNull && a === undefined)
        a = null;
    if (replaceUndefinedWithNull && b === undefined)
        b = null;
    return diff_1.diffJson(a, b);
}
const sleep = (seconds) => new Promise((r, _) => setTimeout(r, seconds * 1000));
async function runUnitTest(client, michelsonFile, test) {
    const contractName = (michelsonFile + ':' + test.name);
    // Setup.
    let registry = config.bootstrapRegistry;
    for (const { name, balance } of test.initial.accounts) {
        registry = await client.implicit(registry, name, config.bootstrapAccount, balance);
    }
    registry = await client.deploy(registry, contractName, config.bootstrapAccount, michelsonFile, test.initial.storage, test.initial.balance);
    // Call contract from bootstrap account.
    const result = await client.call(registry, config.bootstrapAccount, contractName, test.call.params, test.call.amount);
    await sleep(config.clientWait); // Because eztz.send doesn't wait for its transaction to be confirmed.
    // Get final state.
    const balance = await client.balance(registry, contractName); // Get this from .call?
    const accounts = await Promise.all(_.map(test.initial.accounts, async ({ name }) => ({ name, balance: await client.balance(registry, name) })));
    // @ts-ignore Gnarly way to get storage from call result without having to call client.storage.
    const storage = result.operations[result.operations.length - 1].metadata.operation_result.storage;
    return { storage, balance, accounts };
}
// Needs [dir] because contract paths are specified relative to the test file directory
async function runIntegrationTest(client, dir, test) {
    // Setup.
    let registry = config.bootstrapRegistry;
    for (const { name, balance } of test.initial.accounts) {
        registry = await client.implicit(registry, name, config.bootstrapAccount, balance);
    }
    for (const { name, file, balance, storage } of test.initial.contracts) {
        registry = await client.deploy(registry, name, config.bootstrapAccount, path.join(dir, file + '.tz'), storage, balance);
    }
    // Make contract calls.
    for (const { amount, caller, contract, params } of test.calls) {
        await client.call(registry, caller, contract, params, amount);
        await sleep(config.clientWait); // eztz.send doesn't wait for its transaction to be confirmed
    }
    // Get final state.
    const accounts = await Promise.all(_.map(test.initial.accounts, async ({ name }) => ({ name, balance: await client.balance(registry, name) })));
    const contracts = await Promise.all(_.map(test.initial.contracts, async ({ name, file }) => ({
        name,
        file,
        balance: await client.balance(registry, name),
        storage: await client.storage(registry, name)
    })));
    return { accounts, contracts };
}
function diffToString(diff) {
    let s = '';
    for (const part of diff) {
        const color = part.added
            ? colors.green
            : part.removed
                ? colors.red
                : colors.grey;
        s += color(part.value);
    }
    return s;
}
function diffIsEmpty(diff) {
    for (const part of diff) {
        if (part.added || part.removed)
            return false;
    }
    return true;
}
const rl = readline.createInterface(process.stdin, process.stdout);
async function promptYesNo(prompt, { defaultValue }) {
    prompt = prompt + (defaultValue ? ' (y)/n: ' : ' y/(n): ');
    while (1) {
        const input = await new Promise((resolve, _) => rl.question(prompt, resolve));
        if (input === '')
            return defaultValue;
        if (input.toLowerCase() === 'y')
            return true;
        if (input.toLowerCase() === 'n')
            return false;
        console.log("Please enter 'y' or 'n'.");
    }
    throw new Error('unreachable');
}
// Provide helpful defaults to the test writer.
async function readUnitTestFile(file) {
    const tests = await fs.readJson(file);
    for (const test of tests) {
        if (!test.initial.balance)
            test.initial.balance = 0;
        if (!test.initial.accounts)
            test.initial.accounts = [];
        for (const account of test.initial.accounts) {
            if (!account.balance)
                account.balance = 0;
        }
        if (!test.call.amount)
            test.call.amount = 0;
        if (!test.call.caller)
            test.call.caller = config.bootstrapAccount;
    }
    return tests;
}
// Provide helpful defaults to the test writer.
async function readIntegrationTestFile(file) {
    const test = await fs.readJson(file);
    if (!test.initial.accounts)
        test.initial.accounts = [];
    for (const account of test.initial.accounts) {
        if (!account.balance)
            account.balance = 0;
    }
    if (!test.initial.contracts)
        throw new Error('No contracts in integration test data: ' + file);
    for (const contract of test.initial.contracts) {
        if (!contract.balance)
            contract.balance = 0;
    }
    for (const call of test.calls) {
        if (!call.amount)
            call.amount = 0;
        if (!call.caller)
            call.caller = config.bootstrapAccount;
    }
    return test;
}
async function genUnitTestData(client, testFilePairs) {
    for (const { michelsonFile, testFile } of testFilePairs) {
        await genTestData(testFile, async () => {
            const tests = await readUnitTestFile(testFile);
            for (const test of tests) {
                test.expected = await runUnitTest(client, michelsonFile, test);
            }
            return tests;
        });
    }
}
async function genIntegrationTestData(client, testFiles) {
    for (const testFile of testFiles) {
        await genTestData(testFile, async () => {
            const testData = await readIntegrationTestFile(testFile);
            testData.expected = await runIntegrationTest(client, path.dirname(testFile), testData);
            return testData;
        });
    }
}
async function genTestData(testFile, proposedTestFile) {
    const current = await fs.readJson(testFile);
    console.log('Generating new test data for "' + testFile + '"...');
    const proposed = await proposedTestFile();
    console.log('Inspect generated diff. Any changes will be highlighted.');
    console.log(diffToString(diffJson(current, proposed)));
    const ok = await promptYesNo('Ok?', { defaultValue: false });
    if (!ok) {
        console.log('Generated data not ok. Preserving old test data for "' + testFile + '".');
    }
    else {
        console.log('Writing new data for "' + testFile + '".');
        await fs.writeJson(testFile, proposed, { spaces: 2 });
    }
}
function mochaTest(name, { expected, actual }) {
    return new Mocha.Test(name, () => {
        const diff = diffJson(expected, actual);
        if (!diffIsEmpty(diff)) {
            const s = diffToString(diff);
            throw new Error('contract produced nonzero diff with expected storage (red):\n' + s);
        }
    });
}
async function unitTestSuite(client, testFilePairs) {
    const suite = new Mocha.Suite('Unit Tests');
    for (const { michelsonFile, testFile } of testFilePairs) {
        const tests = await readUnitTestFile(testFile);
        const s = new Mocha.Suite(testFile);
        for (const test of tests) {
            const actual = await runUnitTest(client, michelsonFile, test);
            s.addTest(mochaTest(test.name, { actual, expected: test.expected }));
        }
        suite.addSuite(s);
    }
    return suite;
}
async function integrationTestSuite(client, testFiles) {
    const suite = new Mocha.Suite('Integration Tests');
    for (const testFile of testFiles) {
        const test = await readIntegrationTestFile(testFile);
        const actual = await runIntegrationTest(client, path.dirname(testFile), test);
        suite.addTest(mochaTest(testFile, { expected: test.expected, actual }));
    }
    return suite;
}
/**
 * @param globPattern Matches contracts AND test files (so leave out the extension when calling
 * this).
 */
async function test(compile, client, { generate, unit, integration }, globPattern = '**/*') {
    if (!unit && !integration) {
        unit = true;
        integration = true;
    }
    const files = await glob(globPattern);
    const contractFiles = _.filter(files, f => f.endsWith('.liq'));
    for (let contractFile of contractFiles)
        compile(contractFile);
    const unitTestFiles = _.filter(files, f => f.endsWith(config.unitTestExtension));
    const unitTestFilePairs = _.map(unitTestFiles, testFile => ({
        testFile: testFile,
        michelsonFile: (_.trimEnd(testFile, config.unitTestExtension) + '.tz')
    }));
    const integrationTestFiles = _.map(_.filter(files, f => f.endsWith(config.integrationTestExtension)), f => f);
    if (generate) {
        if (unit)
            await genUnitTestData(client, unitTestFilePairs);
        if (integration)
            await genIntegrationTestData(client, integrationTestFiles);
    }
    else {
        const mocha = new Mocha();
        if (unit)
            mocha.suite.addSuite(await unitTestSuite(client, unitTestFilePairs));
        if (integration)
            mocha.suite.addSuite(await integrationTestSuite(client, integrationTestFiles));
        await new Promise((resolve, _) => mocha.run(resolve));
    }
}
exports.test = test;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDRCQUEyQjtBQUMzQixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLCtCQUE4QjtBQUM5QixxQ0FBb0M7QUFDcEMsNkJBQTRCO0FBQzVCLHFDQUFvQztBQUlwQywrQkFBNEM7QUFFNUMsaURBQWlEO0FBQ2pELGdDQUFnQztBQUNoQyxTQUFTLFFBQVEsQ0FDZixDQUFNLEVBQUUsQ0FBTSxFQUFFLEVBQUUsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRTtJQUNqRixJQUFJLHdCQUF3QixJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQTtJQUN6RCxJQUFJLHdCQUF3QixJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQTtJQUN6RCxPQUFPLGVBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDeEIsQ0FBQztBQUVELE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUE7QUFFN0YsS0FBSyxVQUFVLFdBQVcsQ0FDeEIsTUFBYyxFQUNkLGFBQW1CLEVBQ25CLElBQWU7SUFFZixNQUFNLFlBQVksR0FBRyxDQUFDLGFBQWEsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBUyxDQUFBO0lBQzlELFNBQVM7SUFDVCxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUE7SUFDdkMsS0FBSyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENB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