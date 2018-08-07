"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mocha = require("mocha");
const colors = require("colors");
const fs = require("fs-extra");
const glob = require("glob-promise");
const readline = require("readline");
const diff_1 = require("diff");
const config_1 = require("./config");
// TODO: Finish all of these functions.
const deploy = async (eztz, accountSK, contractFile, storage) => '';
// const fund = (eztz: EZTZ, fromSK: Key, toPKH: Address, amount: Number) => null
const call = async (eztz, contract, accountSK, parameters) => Object();
const runCase = async (eztz, contractFile, data) => {
    let contract = await deploy(eztz, config_1.testAccount.sk, contractFile, data.initialStorage);
    return call(eztz, contract, config_1.testAccount.sk, data.callParams);
};
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
const testContract = async (eztz, contractFile, tests) => {
    let suite = new Mocha.Suite(contractFile);
    let runner = new Mocha.Runner(suite, false);
    // runner is never called explicitly but is necessary to create
    let _ = new Mocha.reporters.Spec(runner);
    for (let test of tests) {
        let newStorage = await runCase(eztz, contractFile, test);
        let diff = diff_1.diffJson(test.expectedStorage, newStorage);
        suite.addTest(new Mocha.Test(test.name, async () => {
            if (!diffIsEmpty(diff)) {
                let s = diffToString(diff);
                throw new Error('Contract produced nonzero diff with expected storage (red):\n' + s);
            }
        }));
    }
    runner.run();
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
const genTestData = async (eztz, contractFile, tests, testFile) => {
    console.log('Generating new test data for "' + contractFile + '"...');
    let oldTests = JSON.parse(JSON.stringify(tests));
    for (let test of tests) {
        test.expectedStorage = await runCase(eztz, contractFile, test);
    }
    console.log('Inspect generated diff. Any changes will be highlighted.');
    console.log(diffToString(diff_1.diffJson(oldTests, tests)));
    let ok = await promptYesNo('Ok?', { def: false });
    if (!ok) {
        console.log('Generated data not ok. Preserving old test data for "' + contractFile + '".');
    }
    else {
        console.log('Writing new data for "' + contractFile + '".');
        await fs.writeJson(testFile, tests, { spaces: 2 });
    }
};
const readTestData = async (file) => {
    let x = {
        exists: true,
        valid: true,
        tests: []
    };
    await fs.access(file, fs.constants.F_OK).catch(e => { if (e)
        x.exists = false; });
    x.tests = await fs.readJson(file).catch(e => { if (e)
        x.valid = false; });
    // TODO: better validation
    return x;
};
exports.test = async (compile, eztz, contractGlob, { generate }) => {
    let files = await glob(contractGlob);
    for (let file of files) {
        if (!file.endsWith('.liq'))
            continue;
        let testFile = file + '.test.json';
        let testData = await readTestData(testFile);
        if (!testData.exists) {
            console.warn('Test file not found for "' + file + '". Skipping...');
            continue;
        }
        if (!testData.valid) {
            console.error('Invalid test file for "' + file + '". Skipping...');
            continue;
        }
        compile(file);
        if (generate)
            await genTestData(eztz, file, testData.tests, testFile);
        else
            await testContract(eztz, file, testData.tests);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQThCO0FBQzlCLGlDQUFnQztBQUVoQywrQkFBOEI7QUFDOUIscUNBQW9DO0FBQ3BDLHFDQUFvQztBQUlwQywrQkFBK0I7QUFDL0IscUNBQXNDO0FBRXRDLHVDQUF1QztBQUN2QyxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsSUFBVSxFQUFFLFNBQWMsRUFBRSxZQUFrQixFQUFFLE9BQWEsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFBO0FBRTFGLGlGQUFpRjtBQUVqRixNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsSUFBVSxFQUFFLFFBQWlCLEVBQUUsU0FBYyxFQUFFLFVBQWdCLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRWhHLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxJQUFVLEVBQUUsWUFBa0IsRUFBRSxJQUFrQixFQUFFLEVBQUU7SUFDM0UsSUFBSSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLG9CQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDcEYsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxvQkFBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDOUQsQ0FBQyxDQUFBO0FBRUQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUEwQixFQUFFLEVBQUU7SUFDbEQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ1YsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7WUFDcEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ2QsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO2dCQUNaLENBQUMsQ0FBQyxN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