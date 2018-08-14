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
    await sleep(config.clientWait); // Send doesn't wait for its transaction to be confirmed.
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
    for (const test of tests) {
        if (!test.initial)
            throw Error('Missing initial section.');
        if (!test.call)
            throw Error('Missing call section.');
        if (test.initial.storage === undefined)
            throw Error('Initial storage missing.');
        if (test.call.params === undefined)
            throw Error('Call params missing.');
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
        if (contract.storage === undefined)
            throw Error('Missing contract storage for' + contract.name);
        if (!contract.balance)
            contract.balance = 0;
    }
    for (const call of test.calls) {
        if (call.params === undefined)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLGlDQUFnQztBQUNoQyxtQ0FBa0M7QUFDbEMsK0JBQThCO0FBQzlCLHFDQUFvQztBQUNwQyw2QkFBNEI7QUFDNUIscUNBQW9DO0FBSXBDLCtCQUE0QztBQUU1QyxpREFBaUQ7QUFDakQsZ0NBQWdDO0FBQ2hDLFNBQVMsUUFBUSxDQUNmLENBQU0sRUFDTixDQUFNLEVBQ04sRUFBRSx3QkFBd0IsS0FDdEIsRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUU7SUFFdEMsSUFBSSx3QkFBd0IsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDekQsSUFBSSx3QkFBd0IsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDekQsT0FBTyxlQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLENBQUM7QUFFRCxNQUFNLEtBQUssR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxPQUFPLENBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBRTdGLEtBQUssVUFBVSxXQUFXLENBQ3hCLE1BQWMsRUFDZCxhQUFtQixFQUNuQixJQUFlO0lBRWYsTUFBTSxZQUFZLEdBQUcsQ0FBQyxhQUFhLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQVMsQ0FBQTtJQUM5RCxTQUFTO0lBQ1QsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFBO0lBQ3ZDLEtBQUssTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtRQUNy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