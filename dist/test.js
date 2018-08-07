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
// Sketchy workaround because diffJson TypeErrors if either input is undefined
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
        let diff = diffJson(expected, actual);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLDRCQUEyQjtBQUMzQixpQ0FBZ0M7QUFDaEMsbUNBQWtDO0FBRWxDLCtCQUE4QjtBQUM5QixxQ0FBb0M7QUFDcEMsd0NBQXVDO0FBSXZDLHFDQUFpQztBQUNqQywrQkFBNEM7QUFFNUMsOEVBQThFO0FBQzlFLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBRSxFQUFFO0lBQ2xDLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQzdCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQzdCLE9BQU8sZUFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN4QixDQUFDLENBQUE7QUFFRCxLQUFLLFVBQVUsV0FBVyxDQUFFLElBQVUsRUFBRSxhQUFtQixFQUFFLFFBQW1CO0lBQzlFLE9BQU87SUFDUCwyRkFBMkY7SUFDM0YsK0RBQStEO0lBQy9ELE9BQU8sTUFBTSxFQUFFLENBQUE7QUFDakIsQ0FBQztBQUVELEtBQUssVUFBVSxrQkFBa0IsQ0FBRSxJQUFVLEVBQUUsUUFBMEI7SUFDdkUsT0FBTztJQUNQLE9BQU8sTUFBTSxFQUFFLENBQUE7QUFDakIsQ0FBQztBQUVELE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBVSxFQUFFLEVBQUU7SUFDbEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ1YsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7WUFDcEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ2QsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO2dCQUNaLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRztnQkFDWixD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