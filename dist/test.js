"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mocha = require("mocha");
const _ = require("lodash");
const colors = require("colors");
const config = require("./config");
const fs = require("fs-extra");
const readline = require("readline");
const runGlob = require("glob-promise");
const keygen_1 = require("./keygen");
const diff_1 = require("diff");
const diffJson = (a, b) => {
    if (a === undefined)
        a = null;
    if (b === undefined)
        b = null;
    return diff_1.diffJson(a, b);
};
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
const diffToString = (diff) => {
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
};
const diffIsEmpty = (diff) => {
    for (let part of diff) {
        if (part.added || part.removed)
            return false;
    }
    return true;
};
const rl = readline.createInterface(process.stdin, process.stdout);
const promptYesNo = async (prompt, { def }) => {
    let loop = (resolve) => {
        rl.question(prompt + (def ? ' (y)/n: ' : ' y/(n): '), input => {
            if (input === '') {
                resolve(def);
            }
            else if (input.toLowerCase() === 'y') {
                resolve(true);
            }
            else if (input.toLowerCase() === 'n') {
                resolve(false);
            }
            else {
                console.log("Please enter 'y' or 'n'");
                loop(resolve);
            }
        });
    };
    return new Promise((resolve, _) => { loop(resolve); });
};
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
    let ok = await promptYesNo('Ok?', { def: false });
    if (!ok) {
        console.log('Generated data not ok. Preserving old test data for "' + testFile + '".');
    }
    else {
        console.log('Writing new data for "' + testFile + '".');
        await fs.writeJson(testFile, proposed, { spaces: 2 });
    }
}
function makeMochaTest(name, runTest) {
    return new Mocha.Test(name, async () => {
        let { actual, expected } = await runTest();
        let diff = diffJson(expected, actual); // BUG: exception when expected or actual is undefined
        if (!diffIsEmpty(diff)) {
            let s = diffToString(diff);
            throw new Error('Contract produced nonzero diff with expected storage (red):\n' + s);
        }
    });
}
function unitTestSuite(eztz, testFilePairs) {
    let suite = new Mocha.Suite('Unit Tests');
    for (let { michelsonFile, testFile } of testFilePairs) {
        let tests = fs.readJsonSync(testFile); // TODO: can/should be async?
        // TODO: validate tests object against Test.Unit[]
        let s = new Mocha.Suite(testFile);
        for (let test of tests) {
            s.addTest(makeMochaTest(test.name, async () => {
                let actual = await runUnitTest(eztz, michelsonFile, test);
                return { actual, expected: test.expected };
            }));
        }
        suite.addSuite(s);
    }
    return suite;
}
function integrationTestSuite(eztz, testFiles) {
    let suite = new Mocha.Suite('Integration Tests');
    for (let testFile of testFiles) {
        suite.addTest(makeMochaTest(testFile, async () => {
            let testData = await fs.readJson(testFile);
            // TODO: validate test object against Test.Integration
            let actual = await runIntegrationTest(eztz, testData);
            return { actual, expected: testData.expected };
        }));
    }
    return suite;
}
/**
 * @param glob Matches contracts AND test files (so leave out the extension when calling this)
 */
async function test(compile, eztz, { generate, unit, integration }, glob = '**/*') {
    if (!unit && !integration) {
        unit = true;
        integration = true;
    }
    const keyGen = new keygen_1.KeyGen(eztz, config.seed);
    let files = await runGlob(glob); // BUG: not working??
    console.log(files);
    let contractFiles = _.filter(files, f => f.endsWith('.liq'));
    for (let contractFile of contractFiles)
        compile(contractFile);
    let unitTestFiles = _.filter(files, f => f.endsWith(config.unitTestExtension));
    let unitTestFilePairs = _.map(unitTestFiles, testFile => ({
        testFile,
        michelsonFile: testFile.substr(0, testFile.length - config.unitTestExtension.length) + '.tz'
    }));
    let integrationTestFiles = _.filter(files, f => f.endsWith(config.integrationTestExtension));
    if (generate) {
        if (unit)
            await genUnitTestData(eztz, unitTestFilePairs);
        if (integration)
            await genIntegrationTestData(eztz, integrationTestFiles);
    }
    else {
        let suite = new Mocha.Suite('Liqdev Tests');
        let runner = new Mocha.Runner(suite, false);
        // runner is never called explicitly but is necessary to create
        let _runner = new Mocha.reporters.Spec(runner);
        if (unit)
            suite.addSuite(unitTestSuite(eztz, unitTestFilePairs));
        if (integration)
            suite.addSuite(integrationTestSuite(eztz, integrationTestFiles));
        runner.run();
    }
}
exports.test = test;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDRCQUEyQjtBQUMzQixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBRWxDLCtCQUE4QjtBQUM5QixxQ0FBb0M7QUFDcEMsd0NBQXVDO0FBSXZDLHFDQUFpQztBQUNqQywrQkFBNEM7QUFFNUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFNLEVBQUUsQ0FBTSxFQUFFLEVBQUU7SUFDbEMsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDN0IsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDN0IsT0FBTyxlQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLENBQUMsQ0FBQTtBQUVELEtBQUssVUFBVSxXQUFXLENBQUUsSUFBVSxFQUFFLGFBQW1CLEVBQUUsUUFBbUI7SUFDOUUsT0FBTztJQUNQLDJGQUEyRjtJQUMzRiwrREFBK0Q7SUFDL0QsT0FBTyxNQUFNLEVBQUUsQ0FBQTtBQUNqQixDQUFDO0FBRUQsS0FBSyxVQUFVLGtCQUFrQixDQUFFLElBQVUsRUFBRSxRQUEwQjtJQUN2RSxPQUFPO0lBQ1AsT0FBTyxNQUFNLEVBQUUsQ0FBQTtBQUNqQixDQUFDO0FBRUQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFVLEVBQUUsRUFBRTtJQUNsQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDVixLQUFLLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNyQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSztZQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDZCxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87Z0JBQ1osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHO2dCQUNaLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2pCLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ3ZCO0lBQ0QsT0FBTyxDQUFDLENBQUE7QUFDVixDQUFDLENBQUE7QUFFRCxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQVUsRUFBRSxFQUFFO0lBQ2pDLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ3JCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sS0FBSyxDQUFBO0tBQzdDO0lBQ0QsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDLENBQUE7QUFFRCxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRWxFLE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxNQUFjLEVBQUUsRUFBRSxHQUFHLEVBQW9CLEVBQUUsRUFBRTtJQUN0RSxJQUFJLElBQUksR0FBRyxDQUFDLE9BQVksRUFBRSxFQUFFO1FBQzFCLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQzVELElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtnQkFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2I7aUJBQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssR0FBRyxFQUFFO2dCQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDZDtpQkFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFHLEVBQUU7Z0JBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUNmO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQTtnQkFDdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2FBQ2Q7UUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQTtJQUNELE9BQU8sSUFBSSxPQUFPLENBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNoRSxDQUFDLENBQUE7QUFFRCxLQUFLLFVBQVUsZUFBZSxDQUM1QixJQUFVLEVBQ1YsYUFBd0Q7SUFFeEQsS0FBSyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxJQUFJLGFBQWEsRUFBRTtRQUNyRCxNQUFNLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDckMsSUFBSSxLQUFLLEdBQWdCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNwRCxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO2FBQzdEO1lBQ0QsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDLENBQUMsQ0FBQTtLQUNIO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxzQkFBc0IsQ0FBRSxJQUFVLEVBQUUsU0FBaUI7SUFDbEUsS0FBSyxJQUFJLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDOUIsTUFBTSxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3JDLElBQUksUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUMxQyxRQUFRLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUN0RCxPQUFPLFFBQVEsQ0FBQTtRQUNqQixDQUFDLENBQUMsQ0FBQTtLQUNIO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxXQUFXLENBQUUsUUFBYyxFQUFFLG1CQUF1QztJQUNqRixJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsR0FBRyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUE7SUFDakUsSUFBSSxRQUFRLEdBQUcsTUFBTSxtQkFBbUIsRUFBRSxDQUFBO0lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMERBQTBELENBQUMsQ0FBQTtJQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0RCxJQUFJLEVBQUUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUNqRCxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDdkY7U0FBTTtRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ3ZELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDdEQ7QUFDSCxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUUsSUFBWSxFQUFFLE9BQXNEO0lBQzFGLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtRQUNyQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sT0FBTyxFQUFFLENBQUE7UUFDMUMsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQSxDQUFDLHNEQUFzRDtRQUM1RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ3JGO0lBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQ3BCLElBQVUsRUFDVixhQUF3RDtJQUV4RCxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDekMsS0FBSyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxJQUFJLGFBQWEsRUFBRTtRQUNyRCxJQUFJLEtBQUssR0FBZ0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDLDZCQUE2QjtRQUNoRixrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2pDLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQzVDLElBQUksTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUE7Z0JBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUM1QyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ0o7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2xCO0lBQ0QsT0FBTyxLQUFLLENBQUE7QUFDZCxDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBRSxJQUFVLEVBQUUsU0FBaUI7SUFDMUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFDaEQsS0FBSyxJQUFJLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQy9DLElBQUksUUFBUSxHQUFxQixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDNUQsc0RBQXNEO1lBQ3RELElBQUksTUFBTSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBQ3JELE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNoRCxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ0o7SUFDRCxPQUFPLEtBQUssQ0FBQTtBQUNkLENBQUM7QUFFRDs7R0FFRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQ3hCLE9BQWlCLEVBQ2pCLElBQVUsRUFDVixFQUNFLFFBQVEsRUFDUixJQUFJLEVBQ0osV0FBVyxFQUNHLEVBQ2hCLElBQUksR0FBRyxNQUFNO0lBRWIsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUN6QixJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ1gsV0FBVyxHQUFHLElBQUksQ0FBQTtLQUNuQjtJQUNELE1BQU0sTUFBTSxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDNUMsSUFBSSxLQUFLLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQyxxQkFBcUI7SUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVsQixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUM1RCxLQUFLLElBQUksWUFBWSxJQUFJLGFBQWE7UUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7SUFFN0QsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7SUFDOUUsSUFBSSxpQkFBaUIsR0FDbkIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FDOUIsQ0FBQztRQUNDLFFBQVE7UUFDUixhQUFhLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSztLQUM3RixDQUFDLENBQUMsQ0FBQTtJQUNQLElBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7SUFFNUYsSUFBSSxRQUFRLEVBQUU7UUFDWixJQUFJLElBQUk7WUFBRSxNQUFNLGVBQWUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtRQUN4RCxJQUFJLFdBQVc7WUFBRSxNQUFNLHNCQUFzQixDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO0tBQzFFO1NBQU07UUFDTCxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDM0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUMzQywrREFBK0Q7UUFDL0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM5QyxJQUFJLElBQUk7WUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFBO1FBQ2hFLElBQUksV0FBVztZQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQTtRQUNqRixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUE7S0FDYjtBQUNILENBQUM7QUExQ0Qsb0JBMENDIn0=