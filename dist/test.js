"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mocha = require("mocha");
const _ = require("lodash");
const colors = require("colors");
const config = require("./config");
const fs = require("fs-extra");
const glob = require("glob-promise");
const readline = require("readline");
const keygen_1 = require("./keygen");
const diff_1 = require("diff");
// Sketchy workaround because diffJson TypeErrors if either input is undefined
function diffJson(a, b, { replaceUndefinedWithNull } = { replaceUndefinedWithNull: true }) {
    if (replaceUndefinedWithNull && a === undefined)
        a = null;
    if (replaceUndefinedWithNull && b === undefined)
        b = null;
    return diff_1.diffJson(a, b);
}
async function runUnitTest(eztz, michelsonFile, testData) {
    // TODO
    // let contract = await deploy(eztz, testAccount.sk, contractFile, testData.initialStorage)
    // return call(eztz, contract, testAccount.sk, data.callParams)
    return Object();
}
async function runIntegrationTest(eztz, testData) {
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
async function genUnitTestData(eztz, testFilePairs) {
    for (let { michelsonFile, testFile } of testFilePairs) {
        await genTestData(testFile, async () => {
            let tests = await fs.readJson(testFile);
            for (let test of tests) {
                test.expected = await runUnitTest(eztz, michelsonFile, test);
            }
            return tests;
        });
    }
}
async function genIntegrationTestData(eztz, testFiles) {
    for (let testFile of testFiles) {
        await genTestData(testFile, async () => {
            let testData = await fs.readJson(testFile);
            testData.expected = runIntegrationTest(eztz, testData);
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
async function unitTestSuite(eztz, testFilePairs) {
    let suite = new Mocha.Suite('Unit Tests');
    for (let { michelsonFile, testFile } of testFilePairs) {
        let tests = await fs.readJson(testFile);
        // TODO: validate tests object against Test.Unit[]
        let s = new Mocha.Suite(testFile);
        for (let test of tests) {
            let actual = await runUnitTest(eztz, michelsonFile, test);
            s.addTest(mochaTest(test.name, { actual, expected: test.expected }));
        }
        suite.addSuite(s);
    }
    return suite;
}
async function integrationTestSuite(eztz, testFiles) {
    let suite = new Mocha.Suite('Integration Tests');
    for (let testFile of testFiles) {
        let testData = await fs.readJson(testFile);
        // TODO: validate test object against Test.Integration
        let actual = await runIntegrationTest(eztz, testData);
        suite.addTest(mochaTest(testFile, { expected: testData.expected, actual }));
    }
    return suite;
}
/**
 * @param glob Matches contracts AND test files (so leave out the extension when calling this)
 */
async function test(compile, eztz, { generate, unit, integration }, globPattern = '**/*') {
    console.log(globPattern);
    if (!unit && !integration) {
        unit = true;
        integration = true;
    }
    const keyGen = new keygen_1.KeyGen(eztz, config.seed);
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
            await genUnitTestData(eztz, unitTestFilePairs);
        if (integration)
            await genIntegrationTestData(eztz, integrationTestFiles);
    }
    else {
        let mocha = new Mocha();
        if (unit)
            mocha.suite.addSuite(await unitTestSuite(eztz, unitTestFilePairs));
        if (integration)
            mocha.suite.addSuite(await integrationTestSuite(eztz, integrationTestFiles));
        await new Promise((resolve, _) => mocha.run(resolve));
    }
}
exports.test = test;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDRCQUEyQjtBQUMzQixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBRWxDLCtCQUE4QjtBQUM5QixxQ0FBb0M7QUFDcEMscUNBQW9DO0FBSXBDLHFDQUFpQztBQUNqQywrQkFBNEM7QUFFNUMsOEVBQThFO0FBQzlFLFNBQVMsUUFBUSxDQUNmLENBQU0sRUFBRSxDQUFNLEVBQUUsRUFBRSx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFO0lBQ2pGLElBQUksd0JBQXdCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQ3pELElBQUksd0JBQXdCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQ3pELE9BQU8sZUFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN4QixDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBRSxJQUFVLEVBQUUsYUFBbUIsRUFBRSxRQUFtQjtJQUM5RSxPQUFPO0lBQ1AsMkZBQTJGO0lBQzNGLCtEQUErRDtJQUMvRCxPQUFPLE1BQU0sRUFBRSxDQUFBO0FBQ2pCLENBQUM7QUFFRCxLQUFLLFVBQVUsa0JBQWtCLENBQUUsSUFBVSxFQUFFLFFBQTBCO0lBQ3ZFLE9BQU87SUFDUCxPQUFPLE1BQU0sRUFBRSxDQUFBO0FBQ2pCLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBRSxJQUFVO0lBQy9CLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNWLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ3JCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLO1lBQ3BCLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSztZQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTztnQkFDWixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUc7Z0JBQ1osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDakIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDdkI7SUFDRCxPQUFPLENBQUMsQ0FBQTtBQUNWLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBRSxJQUFVO0lBQzlCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ3JCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sS0FBSyxDQUFBO0tBQzdDO0lBQ0QsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDO0FBRUQsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUVsRSxLQUFLLFVBQVUsV0FBVyxDQUFFLE1BQWMsRUFBRSxFQUFFLFlBQVksRUFBNkI7SUFDckYsT0FBTyxDQUFDLEVBQUU7UUFDUixJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQTtRQUM5SCxJQUFJLEtBQUssS0FBSyxFQUFFO1lBQUUsT0FBTyxZQUFZLENBQUE7UUFDckMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFBO1FBQzVDLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUc7WUFBRSxPQUFPLEtBQUssQ0FBQTtRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7S0FDdkM7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2hDLENBQUM7QUFFRCxLQUFLLFVBQVUsZUFBZSxDQUM1QixJQUFVLEVBQ1YsYUFBd0Q7SUFFeEQsS0FBSyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxJQUFJLGFBQWEsRUFBRTtRQUNyRCxNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDckMsSUFBSSxLQUFLLEdBQWdCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNwRCxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO2FBQzdEO1lBQ0QsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDLENBQUMsQ0FBQTtLQUNIO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxzQkFBc0IsQ0FBRSxJQUFVLEVBQUUsU0FBaUI7SUFDbEUsS0FBSyxJQUFJLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDOUIsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3JDLElBQUksUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUMxQyxRQUFRLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUN0RCxPQUFPLFFBQVEsQ0FBQTtRQUNqQixDQUFDLENBQUMsQ0FBQTtLQUNIO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxXQUFXLENBQUUsUUFBYyxFQUFFLG1CQUF1QztJQUNqRixJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsR0FBRyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUE7SUFDakUsSUFBSSxRQUFRLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFBO0lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMERBQTBELENBQUMsQ0FBQTtJQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0RCxJQUFJLEVBQUUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUMxRCxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDdkY7U0FBTTtRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3ZELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDdEQ7QUFDSCxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUUsSUFBWSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBa0M7SUFDcEYsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtRQUMvQixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3JDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0RBQStELEdBQUcsQ0FBQyxDQUFDLENBQUE7U0FDckY7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUMxQixJQUFVLEVBQ1YsYUFBd0Q7SUFFeEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQ3pDLEtBQUssSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsSUFBSSxhQUFhLEVBQUU7UUFDckQsSUFBSSxLQUFLLEdBQWdCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNwRCxrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2pDLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLElBQUksTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDekQsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUNyRTtRQUNELEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDbEI7SUFDRCxPQUFPLEtBQUssQ0FBQTtBQUNkLENBQUM7QUFFRCxLQUFLLFVBQVUsb0JBQW9CLENBQUUsSUFBVSxFQUFFLFNBQWlCO0lBQ2hFLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQ2hELEtBQUssSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO1FBQzlCLElBQUksUUFBUSxHQUFxQixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUQsc0RBQXNEO1FBQ3RELElBQUksTUFBTSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ3JELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUM1RTtJQUNELE9BQU8sS0FBSyxDQUFBO0FBQ2QsQ0FBQztBQUVEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLElBQUksQ0FDeEIsT0FBaUIsRUFDakIsSUFBVSxFQUNWLEVBQ0UsUUFBUSxFQUNSLElBQUksRUFDSixXQUFXLEVBQ0csRUFDaEIsV0FBVyxHQUFHLE1BQU07SUFFcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUN4QixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ3pCLElBQUksR0FBRyxJQUFJLENBQUE7UUFDWCxXQUFXLEdBQUcsSUFBSSxDQUFBO0tBQ25CO0lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM1QyxJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUVuQyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUM1RCxLQUFLLElBQUksWUFBWSxJQUFJLGFBQWE7UUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7SUFFN0QsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7SUFDOUUsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEQsUUFBUTtRQUNSLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxLQUFLO0tBQ3JFLENBQUMsQ0FBQyxDQUFBO0lBQ0gsSUFBSSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQTtJQUU1RixJQUFJLFFBQVEsRUFBRTtRQUNaLElBQUksSUFBSTtZQUFFLE1BQU0sZUFBZSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO1FBQ3hELElBQUksV0FBVztZQUFFLE1BQU0sc0JBQXNCLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUE7S0FDMUU7U0FBTTtRQUNMLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUE7UUFDdkIsSUFBSSxJQUFJO1lBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxhQUFhLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtRQUM1RSxJQUFJLFdBQVc7WUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLG9CQUFvQixDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUE7UUFDN0YsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtLQUN0RDtBQUNILENBQUM7QUFyQ0Qsb0JBcUNDIn0=