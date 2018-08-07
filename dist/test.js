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
    console.log(diffToString(diff_1.diffJson(current, proposed)));
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
        let diff = diff_1.diffJson(expected, actual);
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
            s.addTest(makeMochaTest(testFile, async () => {
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
 * @param glob Matches contracts AND test files (leave out extension)
 */
async function test(compile, eztz, { generate, unit, integration }, glob = '**/*') {
    const keyGen = new keygen_1.KeyGen(eztz, 0);
    let files = await runGlob(glob);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDRCQUEyQjtBQUMzQixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBRWxDLCtCQUE4QjtBQUM5QixxQ0FBb0M7QUFDcEMsd0NBQXVDO0FBSXZDLHFDQUFpQztBQUNqQywrQkFBK0I7QUFFL0IsS0FBSyxVQUFVLFdBQVcsQ0FBRSxJQUFVLEVBQUUsYUFBbUIsRUFBRSxRQUFtQjtJQUM5RSxPQUFPO0lBQ1AsMkZBQTJGO0lBQzNGLCtEQUErRDtJQUMvRCxPQUFPLE1BQU0sRUFBRSxDQUFBO0FBQ2pCLENBQUM7QUFFRCxLQUFLLFVBQVUsa0JBQWtCLENBQUUsSUFBVSxFQUFFLFFBQTBCO0lBQ3ZFLE9BQU87SUFDUCxPQUFPLE1BQU0sRUFBRSxDQUFBO0FBQ2pCLENBQUM7QUFFRCxNQUFNLFlBQVksR0FBRyxDQUFDLElBQVUsRUFBRSxFQUFFO0lBQ2xDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNWLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ3JCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLO1lBQ3BCLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSztZQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTztnQkFDWixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUc7Z0JBQ1osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDakIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDdkI7SUFDRCxPQUFPLENBQUMsQ0FBQTtBQUNWLENBQUMsQ0FBQTtBQUVELE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBVSxFQUFFLEVBQUU7SUFDakMsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDckIsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJ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