"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Mocha = require("mocha");
const colors = require("colors");
const fs = require("fs-extra");
const glob = require("glob-promise");
const readline = require("readline");
const diff_1 = require("diff");
// TODO: Finish all of these functions.
const deploy = (eztz, accountSK, contractPath) => '';
// const fund = (eztz: EZTZ, fromSK: Key, toPKH: Address, amount: Number) => null
const call = (eztz, contractAddress, accountSK, parameters) => null;
const runCase = (eztz, contractPath, testCaseData) => tslib_1.__awaiter(this, void 0, void 0, function* () { return Object(); }); // return new storage
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
const testContract = (eztz, contractPath, tests) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let suite = new Mocha.Suite(contractPath);
    let runner = new Mocha.Runner(suite, false);
    // runner is never called explicitly but is necessary to create
    let _ = new Mocha.reporters.Spec(runner);
    for (let test of tests) {
        let newStorage = yield runCase(eztz, contractPath, test);
        let diff = diff_1.diffJson(test.expectedStorage, newStorage);
        suite.addTest(new Mocha.Test(test.name, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!diffIsEmpty(diff)) {
                let s = diffToString(diff);
                throw new Error('Contract produced nonzero diff with expected storage (red):\n' + s);
            }
        })));
    }
    runner.run();
});
const rl = readline.createInterface(process.stdin, process.stdout);
const promptYesNo = (prompt, { def }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
});
const genTestData = (eztz, contractPath, tests, testFile) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    console.log('Generating new test data for "' + contractPath + '"...');
    let oldTests = JSON.parse(JSON.stringify(tests));
    for (let test of tests) {
        test.expectedStorage = yield runCase(eztz, contractPath, test);
    }
    console.log('Inspect generated diff. Any changes will be highlighted.');
    console.log(diffToString(diff_1.diffJson(oldTests, tests)));
    let ok = yield promptYesNo('Ok?', { def: false });
    if (!ok) {
        console.log('Generated data not ok. Preserving old test data for "' + contractPath + '".');
    }
    else {
        console.log('Writing new data for "' + contractPath + '".');
        yield fs.writeJson(testFile, tests, { spaces: 2 });
    }
});
const readTestData = (file) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let x = {
        exists: true,
        valid: true,
        tests: []
    };
    yield fs.access(file, fs.constants.F_OK).catch(e => { if (e)
        x.exists = false; });
    x.tests = yield fs.readJson(file).catch(e => { if (e)
        x.valid = false; });
    // TODO: better validation
    return x;
});
exports.test = (compile, eztz, contractGlob, { generate }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let files = yield glob(contractGlob);
    for (let file of files) {
        if (!file.endsWith('.liq'))
            continue;
        let testFile = file + '.test.json';
        let testData = yield readTestData(testFile);
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
            yield genTestData(eztz, file, testData.tests, testFile);
        else
            yield testContract(eztz, file, testData.tests);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQUE4QjtBQUM5QixpQ0FBZ0M7QUFFaEMsK0JBQThCO0FBQzlCLHFDQUFvQztBQUNwQyxxQ0FBb0M7QUFJcEMsK0JBQStCO0FBRS9CLHVDQUF1QztBQUN2QyxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQVUsRUFBRSxTQUFjLEVBQUUsWUFBa0IsRUFBVyxFQUFFLENBQUMsRUFBRSxDQUFBO0FBRTlFLGlGQUFpRjtBQUNqRixNQUFNLElBQUksR0FBRyxDQUFDLElBQVUsRUFBRSxlQUF3QixFQUFFLFNBQWMsRUFBRSxVQUFrQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUE7QUFDL0YsTUFBTSxPQUFPLEdBQUcsQ0FBTyxJQUFVLEVBQUUsWUFBa0IsRUFBRSxZQUEwQixFQUFFLEVBQUUsd0RBQUMsT0FBQSxNQUFNLEVBQUUsQ0FBQSxHQUFBLENBQUEsQ0FBQyxxQkFBcUI7QUFFcEgsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUEwQixFQUFFLEVBQUU7SUFDbEQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ1YsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7WUFDcEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ2QsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO2dCQUNaLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRztnQkFDWixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUNqQixDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUN2QjtJQUNELE9BQU8sQ0FBQyxDQUFBO0FBQ1YsQ0FBQyxDQUFBO0FBRUQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUEwQixFQUFFLEVBQUU7SUFDakQsS0FBSyxJ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