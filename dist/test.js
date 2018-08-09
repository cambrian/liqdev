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
    const contractName = michelsonFile + ':' + test.name;
    // Setup
    let registry = config.bootstrapRegistry;
    for (const { name, balance } of test.initial.accounts) {
        registry = await client.implicit(registry, name, config.bootstrapAccount, balance);
    }
    registry = await client.deploy(registry, contractName, config.bootstrapAccount, michelsonFile, test.initial.storage, // Sus.
    test.initial.balance);
    // Call contract from bootstrap account.
    const result = await client.call(registry, config.bootstrapAccount, contractName, test.call.params, test.call.amount);
    // Get final state.
    const balance = await client.balance(registry, contractName); // Can we get this from .call?
    const accounts = await Promise.all(_.map(test.initial.accounts, async ({ name }) => ({ name, balance: await client.balance(registry, name) })));
    // @ts-ignore gnarly way to get storage from call result without having to call client.storage
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
        registry = await client.deploy(registry, name, config.bootstrapAccount, path.join(dir, file + '.tz'), // Sus.
        storage, // Also sus.
        balance);
    }
    // Make contract calls.
    for (const { amount, caller, contract, params } of test.calls) {
        for (let i = 0; i < 10; i++) {
            console.log({ amount, caller, contract, params });
            let result = await client.call(registry, caller, contract, params, amount);
            console.log(result);
        }
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
// provide helpful defaults to the test writer
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
// provide helpful defaults to the test writer
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
    console.log(globPattern);
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
        testFile,
        michelsonFile: _.trimEnd(testFile, config.unitTestExtension) + '.tz'
    }));
    const integrationTestFiles = _.filter(files, f => f.endsWith(config.integrationTestExtension));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDRCQUEyQjtBQUMzQixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLCtCQUE4QjtBQUM5QixxQ0FBb0M7QUFDcEMsNkJBQTRCO0FBQzVCLHFDQUFvQztBQUlwQywrQkFBNEM7QUFFNUMsaURBQWlEO0FBQ2pELGdDQUFnQztBQUNoQyxTQUFTLFFBQVEsQ0FDZixDQUFNLEVBQUUsQ0FBTSxFQUFFLEVBQUUsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRTtJQUNqRixJQUFJLHdCQUF3QixJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQTtJQUN6RCxJQUFJLHdCQUF3QixJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQTtJQUN6RCxPQUFPLGVBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDeEIsQ0FBQztBQUVELE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUE7QUFFN0YsS0FBSyxVQUFVLFdBQVcsQ0FDeEIsTUFBYyxFQUNkLGFBQW1CLEVBQ25CLElBQWU7SUFFZixNQUFNLFlBQVksR0FBRyxhQUFhLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDcEQsUUFBUTtJQUNSLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQTtJQUN2QyxLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVB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