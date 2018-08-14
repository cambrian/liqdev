"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mocha = require("mocha");
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
    const accounts = await Promise.all(test.initial.accounts.map(async ({ name }) => ({ name, balance: await client.balance(registry, name) })));
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
    const accounts = await Promise.all(test.initial.accounts.map(async ({ name }) => ({ name, balance: await client.balance(registry, name) })));
    const contracts = await Promise.all(test.initial.contracts.map(async ({ name, file }) => ({
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
    throw Error('unreachable');
}
// Provide helpful defaults to the test writer.
async function readUnitTestFile(file) {
    // check that the contract file exists
    const michelsonFile = (file.slice(0, -config.unitTestExtension.length) + '.tz');
    if (!await fs.pathExists(michelsonFile)) {
        throw Error('"' + michelsonFile + '" not found for test "' + file + '".');
    }
    // read test data and provide default values
    const tests = await fs.readJson(file);
    for (const { initial, call } of tests) {
        if (!initial)
            throw Error('Missing initial section.');
        if (!call)
            throw Error('Missing call section.');
        if (!initial.storage)
            throw Error('Initial storage missing.');
        if (!call.params)
            throw Error('Call params missing.');
        if (!initial.balance)
            initial.balance = 0;
        if (!initial.accounts)
            initial.accounts = [];
        for (const account of initial.accounts) {
            if (!account.balance)
                account.balance = 0;
        }
        if (!call.amount)
            call.amount = 0;
        if (!call.caller)
            call.caller = config.bootstrapAccount;
    }
    return { tests, michelsonFile };
}
// Provide helpful defaults to the test writer.
async function readIntegrationTestFile(file) {
    const test = await fs.readJson(file);
    if (!test.initial)
        throw Error('Missing initial section.');
    if (!test.calls)
        throw Error('Missing calls section.');
    if (!test.initial.accounts)
        test.initial.accounts = [];
    for (const account of test.initial.accounts) {
        if (!account.balance)
            account.balance = 0;
    }
    if (!test.initial.contracts)
        throw Error('No contracts in integration test data: ' + file);
    for (const contract of test.initial.contracts) {
        if (!contract.storage)
            throw Error('Missing contract storage for' + contract.name);
        if (!contract.balance)
            contract.balance = 0;
    }
    for (const call of test.calls) {
        if (!call.params)
            throw Error('Missing call params for' + JSON.stringify(call));
        if (!call.amount)
            call.amount = 0;
        if (!call.caller)
            call.caller = config.bootstrapAccount;
    }
    return test;
}
async function genUnitTestData(client, testFiles) {
    for (const testFile of testFiles) {
        await genTestData(testFile, async () => {
            const { tests, michelsonFile } = await readUnitTestFile(testFile);
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
async function unitTestSuite(client, testFiles) {
    const suite = new Mocha.Suite('Unit Tests');
    for (const testFile of testFiles) {
        const { tests, michelsonFile } = await readUnitTestFile(testFile);
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
    const contractFiles = files.filter(f => f.endsWith('.liq'));
    for (let contractFile of contractFiles)
        compile(contractFile);
    const unitTestFiles = files.filter(f => f.endsWith(config.unitTestExtension));
    const integrationTestFiles = files.filter(f => f.endsWith(config.integrationTestExtension));
    if (generate) {
        if (unit)
            await genUnitTestData(client, unitTestFiles);
        if (integration)
            await genIntegrationTestData(client, integrationTestFiles);
    }
    else {
        const mocha = new Mocha();
        if (unit)
            mocha.suite.addSuite(await unitTestSuite(client, unitTestFiles));
        if (integration)
            mocha.suite.addSuite(await integrationTestSuite(client, integrationTestFiles));
        await new Promise((resolve, _) => mocha.run(resolve));
    }
}
exports.test = test;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLGlDQUFnQztBQUNoQyxtQ0FBa0M7QUFDbEMsK0JBQThCO0FBQzlCLHFDQUFvQztBQUNwQyw2QkFBNEI7QUFDNUIscUNBQW9DO0FBSXBDLCtCQUE0QztBQUU1QyxpREFBaUQ7QUFDakQsZ0NBQWdDO0FBQ2hDLFNBQVMsUUFBUSxDQUNmLENBQU0sRUFBRSxDQUFNLEVBQUUsRUFBRSx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFO0lBQ2pGLElBQUksd0JBQXdCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQ3pELElBQUksd0JBQXdCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQ3pELE9BQU8sZUFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN4QixDQUFDO0FBRUQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUU3RixLQUFLLFVBQVUsV0FBVyxDQUN4QixNQUFjLEVBQ2QsYUFBbUIsRUFDbkIsSUFBZTtJQUVmLE1BQU0sWUFBWSxHQUFHLENBQUMsYUFBYSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFTLENBQUE7SUFDOUQsU0FBUztJQUNULElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQTtJQUN2QyxLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7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