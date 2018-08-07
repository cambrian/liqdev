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
const jsonDiff = (a, b) => diffToString(diff_1.diffJson(a, b));
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
    // runner is never called explicitly but necessary to create
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
    console.log(jsonDiff(oldTests, tests));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQUE4QjtBQUM5QixpQ0FBZ0M7QUFFaEMsK0JBQThCO0FBQzlCLHFDQUFvQztBQUNwQyxxQ0FBb0M7QUFLcEMsK0JBQStCO0FBRS9CLHVDQUF1QztBQUN2QyxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQVUsRUFBRSxTQUFjLEVBQUUsWUFBa0IsRUFBVyxFQUFFLENBQUMsRUFBRSxDQUFBO0FBRTlFLGlGQUFpRjtBQUNqRixNQUFNLElBQUksR0FBRyxDQUFDLElBQVUsRUFBRSxlQUF3QixFQUFFLFNBQWMsRUFBRSxVQUFrQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUE7QUFDL0YsTUFBTSxPQUFPLEdBQUcsQ0FBTyxJQUFVLEVBQUUsWUFBa0IsRUFBRSxZQUEwQixFQUFFLEVBQUUsd0RBQUMsT0FBQSxNQUFNLEVBQUUsQ0FBQSxHQUFBLENBQUEsQ0FBQyxxQkFBcUI7QUFFcEgsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUEwQixFQUFFLEVBQUU7SUFDbEQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ1YsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7WUFDcEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ2QsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO2dCQUNaLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRztnQkFDWixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUNqQixDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUN2QjtJQUNELE9BQU8sQ0FBQyxDQUFBO0FBQ1YsQ0FBQyxDQUFBO0FBRUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFNLEVBQUUsQ0FBTSxFQUFFLEVBQUUsQ0FB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