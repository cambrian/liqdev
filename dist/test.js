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
    throw new Error('unreachable');
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