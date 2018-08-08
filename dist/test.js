"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mocha = require("mocha");
const _ = require("lodash");
const colors = require("colors");
const config = require("./config");
const fs = require("fs-extra");
const glob = require("glob-promise");
const readline = require("readline");
const diff_1 = require("diff");
// Sketchy workaround because diffJson TypeErrors if either input is undefined
function diffJson(a, b, { replaceUndefinedWithNull } = { replaceUndefinedWithNull: true }) {
    if (replaceUndefinedWithNull && a === undefined)
        a = null;
    if (replaceUndefinedWithNull && b === undefined)
        b = null;
    return diff_1.diffJson(a, b);
}
async function runUnitTest(client, michelsonFile, test) {
    let registry = config.bootstrapRegistry;
    for (let account of test.initial.accounts) {
        registry = await client.implicit(registry, account.name, 'bootstrap1', account.balance);
    }
    // TODO
    // let contract = await deploy(client, testAccount.sk, contractFile, testData.initialStorage)
    // return call(client, contract, testAccount.sk, data.callParams)
    return Object();
}
async function runIntegrationTest(client, test) {
    // TODO
    return Object();
}
function diffToString(diff) {
    let s = '';
    for (let part of diff) {
        let color = part.added
            ? colors.green
            : part.removed
                ? colors.red
                : colors.grey;
        s += color(part.value);
    }
    return s;
}
function diffIsEmpty(diff) {
    for (let part of diff) {
        if (part.added || part.removed)
            return false;
    }
    return true;
}
const rl = readline.createInterface(process.stdin, process.stdout);
async function promptYesNo(prompt, { defaultValue }) {
    while (1) {
        let input = await new Promise((resolve, _) => rl.question(prompt + (defaultValue ? ' (y)/n: ' : ' y/(n): '), resolve));
        if (input === '')
            return defaultValue;
        if (input.toLowerCase() === 'y')
            return true;
        if (input.toLowerCase() === 'n')
            return false;
        console.log("Please enter 'y' or 'n'");
    }
    throw new Error('unreachable');
}
async function genUnitTestData(client, testFilePairs) {
    for (let { michelsonFile, testFile } of testFilePairs) {
        await genTestData(testFile, async () => {
            let tests = await fs.readJson(testFile);
            for (let test of tests) {
                test.expected = await runUnitTest(client, michelsonFile, test);
            }
            return tests;
        });
    }
}
async function genIntegrationTestData(client, testFiles) {
    for (let testFile of testFiles) {
        await genTestData(testFile, async () => {
            let testData = await fs.readJson(testFile);
            testData.expected = runIntegrationTest(client, testData);
            return testData;
        });
    }
}
async function genTestData(testFile, getProposedTestFile) {
    let current = await fs.readJson(testFile);
    console.log('Generating new test data for "' + testFile + '"...');
    let proposed = await getProposedTestFile();
    console.log('Inspect generated diff. Any changes will be highlighted.');
    console.log(diffToString(diffJson(current, proposed)));
    let ok = await promptYesNo('Ok?', { defaultValue: false });
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
        let diff = diffJson(expected, actual);
        if (!diffIsEmpty(diff)) {
            let s = diffToString(diff);
            throw new Error('Contract produced nonzero diff with expected storage (red):\n' + s);
        }
    });
}
async function unitTestSuite(client, testFilePairs) {
    let suite = new Mocha.Suite('Unit Tests');
    for (let { michelsonFile, testFile } of testFilePairs) {
        let tests = await fs.readJson(testFile);
        // TODO: validate tests object against Test.Unit[]
        let s = new Mocha.Suite(testFile);
        for (let test of tests) {
            let actual = await runUnitTest(client, michelsonFile, test);
            s.addTest(mochaTest(test.name, { actual, expected: test.expected }));
        }
        suite.addSuite(s);
    }
    return suite;
}
async function integrationTestSuite(client, testFiles) {
    let suite = new Mocha.Suite('Integration Tests');
    for (let testFile of testFiles) {
        let testData = await fs.readJson(testFile);
        // TODO: validate test object against Test.Integration
        let actual = await runIntegrationTest(client, testData);
        suite.addTest(mochaTest(testFile, { expected: testData.expected, actual }));
    }
    return suite;
}
/**
 * @param globPattern Matches contracts AND test files (so leave out the extension when calling this)
 */
async function test(compile, client, { generate, unit, integration }, globPattern = '**/*') {
    console.log(globPattern);
    if (!unit && !integration) {
        unit = true;
        integration = true;
    }
    let files = await glob(globPattern);
    let contractFiles = _.filter(files, f => f.endsWith('.liq'));
    for (let contractFile of contractFiles)
        compile(contractFile);
    let unitTestFiles = _.filter(files, f => f.endsWith(config.unitTestExtension));
    let unitTestFilePairs = _.map(unitTestFiles, testFile => ({
        testFile,
        michelsonFile: _.trimEnd(testFile, config.unitTestExtension) + '.tz'
    }));
    let integrationTestFiles = _.filter(files, f => f.endsWith(config.integrationTestExtension));
    if (generate) {
        if (unit)
            await genUnitTestData(client, unitTestFilePairs);
        if (integration)
            await genIntegrationTestData(client, integrationTestFiles);
    }
    else {
        let mocha = new Mocha();
        if (unit)
            mocha.suite.addSuite(await unitTestSuite(client, unitTestFilePairs));
        if (integration)
            mocha.suite.addSuite(await integrationTestSuite(client, integrationTestFiles));
        await new Promise((resolve, _) => mocha.run(resolve));
    }
}
exports.test = test;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDRCQUEyQjtBQUMzQixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBQ2xDLCtCQUE4QjtBQUM5QixxQ0FBb0M7QUFDcEMscUNBQW9DO0FBSXBDLCtCQUE0QztBQUU1Qyw4RUFBOEU7QUFDOUUsU0FBUyxRQUFRLENBQ2YsQ0FBTSxFQUFFLENBQU0sRUFBRSxFQUFFLHdCQUF3QixFQUFFLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUU7SUFDakYsSUFBSSx3QkFBd0IsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDekQsSUFBSSx3QkFBd0IsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDekQsT0FBTyxlQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLENBQUM7QUFFRCxLQUFLLFVBQVUsV0FBVyxDQUFFLE1BQWMsRUFBRSxhQUFtQixFQUFFLElBQWU7SUFDOUUsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFBO0lBQ3ZDLEtBQUssSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7UUFDekMsUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3hGO0lBQ0QsT0FBTztJQUNQLDZGQUE2RjtJQUM3RixpRUFBaUU7SUFDakUsT0FBTyxNQUFNLEVBQUUsQ0FBQTtBQUNqQixDQUFDO0FBRUQsS0FBSyxVQUFVLGtCQUFrQixDQUFFLE1BQWMsRUFBRSxJQUFzQjtJQUN2RSxPQUFPO0lBQ1AsT0FBTyxNQUFNLEVBQUUsQ0FBQTtBQUNqQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUUsSUFBVTtJQUMvQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDVixLQUFLLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNyQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSztZQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDZCxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87Z0JBQ1osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHO2dCQUNaLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2pCLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ3ZCO0lBQ0QsT0FBTyxDQUFDLENBQUE7QUFDVixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUUsSUFBVTtJQUM5QixLQUFLLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNyQixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPLEtBQUssQ0FBQTtLQUM3QztJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQUVELE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFFbEUsS0FBSyxVQUFVLFdBQVcsQ0FBRSxNQUFjLEVBQUUsRUFBRSxZQUFZLEVBQTZCO0lBQ3JGLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7UUFDOUgsSUFBSSxLQUFLLEtBQUssRUFBRTtZQUFFLE9BQU8sWUFBWSxDQUFBO1FBQ3JDLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUc7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUM1QyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFHO1lBQUUsT0FBTyxLQUFLLENBQUE7UUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0tBQ3ZDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNoQyxDQUFDO0FBRUQsS0FBSyxVQUFVLGVBQWUsQ0FDNUIsTUFBYyxFQUNkLGFBQXdEO0lBRXhELEtBQUssSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsSUFBSSxhQUFhLEVBQUU7UUFDckQsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3JDLElBQUksS0FBSyxHQUFnQixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDcEQsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQTthQUMvRDtZQUNELE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQyxDQUFDLENBQUE7S0FDSDtBQUNILENBQUM7QUFFRCxLQUFLLFVBQVUsc0JBQXNCLENBQUUsTUFBYyxFQUFFLFNBQWlCO0lBQ3RFLEtBQUssSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO1FBQzlCLE1BQU0sV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNyQyxJQUFJLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDMUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDeEQsT0FBTyxRQUFRLENBQUE7UUFDakIsQ0FBQyxDQUFDLENBQUE7S0FDSDtBQUNILENBQUM7QUFFRCxLQUFLLFVBQVUsV0FBVyxDQUFFLFFBQWMsRUFBRSxtQkFBdUM7SUFDakYsSUFBSSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFBO0lBQ2pFLElBQUksUUFBUSxHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQTtJQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLDBEQUEwRCxDQUFDLENBQUE7SUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEQsSUFBSSxFQUFFLEdBQUcsTUFBTSxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDMUQsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsdURBQXVELEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3ZGO1NBQU07UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUN2RCxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQ3REO0FBQ0gsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFFLElBQVksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWtDO0lBQ3BGLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7UUFDL0IsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ3JGO0lBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsS0FBSyxVQUFVLGFBQWEsQ0FDMUIsTUFBYyxFQUNkLGFBQXdEO0lBRXhELElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQTtJQUN6QyxLQUFLLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLElBQUksYUFBYSxFQUFFO1FBQ3JELElBQUksS0FBSyxHQUFnQixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDcEQsa0RBQWtEO1FBQ2xELElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNqQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN0QixJQUFJLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQzNELENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDckU7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2xCO0lBQ0QsT0FBTyxLQUFLLENBQUE7QUFDZCxDQUFDO0FBRUQsS0FBSyxVQUFVLG9CQUFvQixDQUFFLE1BQWMsRUFBRSxTQUFpQjtJQUNwRSxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUNoRCxLQUFLLElBQUksUUFBUSxJQUFJLFNBQVMsRUFBRTtRQUM5QixJQUFJLFFBQVEsR0FBcUIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzVELHNEQUFzRDtRQUN0RCxJQUFJLE1BQU0sR0FBRyxNQUFNLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN2RCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDNUU7SUFDRCxPQUFPLEtBQUssQ0FBQTtBQUNkLENBQUM7QUFFRDs7R0FFRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQ3hCLE9BQWlCLEVBQ2pCLE1BQWMsRUFDZCxFQUNFLFFBQVEsRUFDUixJQUFJLEVBQ0osV0FBVyxFQUNHLEVBQ2hCLFdBQVcsR0FBRyxNQUFNO0lBRXBCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDeEIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUN6QixJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ1gsV0FBVyxHQUFHLElBQUksQ0FBQTtLQUNuQjtJQUNELElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRW5DLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQzVELEtBQUssSUFBSSxZQUFZLElBQUksYUFBYTtRQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtJQUU3RCxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtJQUM5RSxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RCxRQUFRO1FBQ1IsYUFBYSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEtBQUs7S0FDckUsQ0FBQyxDQUFDLENBQUE7SUFDSCxJQUFJLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFBO0lBRTVGLElBQUksUUFBUSxFQUFFO1FBQ1osSUFBSSxJQUFJO1lBQUUsTUFBTSxlQUFlLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUE7UUFDMUQsSUFBSSxXQUFXO1lBQUUsTUFBTSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtLQUM1RTtTQUFNO1FBQ0wsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQTtRQUN2QixJQUFJLElBQUk7WUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLGFBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFBO1FBQzlFLElBQUksV0FBVztZQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sb0JBQW9CLENBQUMsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQTtRQUMvRixNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0tBQ3REO0FBQ0gsQ0FBQztBQXBDRCxvQkFvQ0MifQ==