#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("./config");
const fs = require("fs");
const os = require("os");
const program = require("commander");
const client_1 = require("./client");
const build_1 = require("./build");
const keygen_1 = require("./keygen");
const shelljs_1 = require("shelljs");
const eztz_1 = require("eztz");
const child_process_1 = require("child_process");
const test_1 = require("./test");
const compile = build_1.createCompiler(config.compilerPath);
const globalBinPath = shelljs_1.exec('npm bin -g', { silent: true }).stdout.toString().slice(0, -1); // Lmao.
const runGlobally = process.argv[1] === globalBinPath + '/' + config.commandName;
console.log('Running all scripts ' + (runGlobally ? 'globally' : 'locally') + '.');
// Hard-coded but should eventually be an option.
eztz_1.eztz.node.setProvider(config.defaultProvider);
const verifySetup = () => {
    const compilerPathAbsolute = config.compilerPath.replace(/^~/, os.homedir());
    if (!fs.existsSync(compilerPathAbsolute)) {
        console.log('Liquidity compiler not found.');
        console.error('You must run setup before running any other tasks.');
        process.exit(1);
    }
};
const verifySandbox = () => {
    const result = shelljs_1.exec('lsof -i :18731 | grep main_bake', { silent: true });
    if (result.stdout.toString().length <= 0) {
        console.log('Sandbox is not running.');
        console.log('You must run the sandbox to run Liquidity contracts.');
        process.exit(1);
    }
};
program
    .version('0.0.1', '-v, --version')
    .description('Swiss army knife for Liquidity development')
    .on('command:*', () => {
    console.error('Invalid task provided: %s.\nSee --help for available tasks.', program.args.join(' '));
    process.exit(1);
});
program
    .command('sanjay')
    .description('remove this eventually')
    .action(() => {
    const keyGen = new keygen_1.KeyGen(eztz_1.eztz, 0);
    client_1.account(eztz_1.eztz, keyGen, eztz_1.eztz.crypto.extractKeys(config.testAccount.sk), 1337)
        .then(newAccount => client_1.balance(eztz_1.eztz, newAccount))
        .then(console.log);
});
program
    .command('setup')
    .description('install Liquidity and Tezos')
    .action(() => shelljs_1.exec(runGlobally ? config.setupPath.global : config.setupPath.local))
    .action(() => process.exit(0)); // TODO: Figure out a more sustainable solution.
program
    .command('sandbox')
    .description('run sandbox Tezos network and set up client in shell')
    .action(verifySetup)
    .action(() => shelljs_1.exec(runGlobally ? config.killPath.global : config.killPath.local))
    .action(() => child_process_1.spawn(runGlobally ? config.bakerPath.global
    : config.bakerPath.local, [], { detached: true, stdio: 'inherit' }).unref())
    .action(() => process.exit(0));
program
    .command('kill')
    .description('kills sandbox Tezos network')
    .action(() => shelljs_1.exec(runGlobally ? config.killPath.global : config.killPath.local))
    .action(() => process.exit(0));
program
    .command('build [contract]')
    .description('compile Liquidity contracts (omit parameter to watch)')
    .action(verifySetup)
    .action((contract) => contract
    ? compile(contract + '.liq') && process.exit(0)
    : build_1.startWatcher(compile));
program
    .command('test [glob]')
    .description('test Liquidity files matching a glob pattern')
    .option('-g, --generate', 'generate or overwrite expected data')
    .option('-u, --unit', 'run only unit tests')
    .option('-i, --integration', 'run only integration tests')
    .action(verifySetup)
    .action(verifySandbox)
    .action((glob, args) => test_1.test(compile, eztz_1.eztz, args, glob) /* .then(() => process.exit(0)) */);
// Note: Mocha seems to have some spooky bug where it doesn't wait for its tests.
// Liqdev test gets interrupted mid-test by process.exit(0), so for now we're requiring the user to
// manually ctrl-c.
program
    .command('deploy')
    .description('deploy contract to any of the tezos networks')
    .action(verifySetup)
    .action(() => shelljs_1.exec(runGlobally ? config.deployPath.global : config.deployPath.local))
    .action(() => process.exit(0));
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '));
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxtQ0FBa0M7QUFDbEMseUJBQXdCO0FBQ3hCLHlCQUF3QjtBQUN4QixxQ0FBb0M7QUFFcEMscUNBQTBEO0FBQzFELG1DQUFzRDtBQUV0RCxxQ0FBaUM7QUFDakMscUNBQThCO0FBQzlCLCtCQUEyQjtBQUMzQixpREFBcUM7QUFDckMsaUNBQTZCO0FBRTdCLE1BQU0sT0FBTyxHQUFHLHNCQUFjLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ25ELE1BQU0sYUFBYSxHQUFHLGNBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsUUFBUTtBQUNsRyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLGFBQWEsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQTtBQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0FBRWxGLGlEQUFpRDtBQUNqRCxXQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7QUFFN0MsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFO0lBQ3ZCLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzVFLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLG9C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