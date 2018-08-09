#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const config = require("./config");
const fs = require("fs");
const os = require("os");
const program = require("commander");
// import { account, balance, call, storage } from './client'
const build_1 = require("./build");
const client_1 = require("./client");
const shelljs_1 = require("shelljs");
const eztz_1 = require("eztz");
const child_process_1 = require("child_process");
const test_1 = require("./test");
const compile = build_1.createCompiler(config.compilerPath);
const globalBinPath = shelljs_1.exec('npm bin -g', { silent: true }).stdout.toString().slice(0, -1); // Lmao.
const runGlobally = process.argv[1] === globalBinPath + '/' + config.commandName;
console.log('Running all scripts ' + (runGlobally ? 'globally' : 'locally') + '.');
// Not called directly to defer its
// execution (only test needs this)
const createTezosClient = () => {
    const tezosClientPath = fs.readFileSync(config.tezosClientPath.replace(/^~/, os.homedir()))
        .slice(0, -1); // Lmao again (strip new line character).
    return (command) => shelljs_1.exec(tezosClientPath + ' ' + command);
};
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
    .version('0.2.0', '-v, --version')
    .description('Swiss army knife for Liquidity development')
    .on('command:*', () => {
    console.error('Invalid task provided: %s.\nSee --help for available tasks.', program.args.join(' '));
    process.exit(1);
});
program
    .command('sanjay')
    .description('remove this eventually')
    .action(() => {
    const client = client_1.createClient(eztz_1.eztz, createTezosClient(), { seed: 20 });
    client.deploy(config.bootstrapRegistry, 'hlorl', 'bootstrap1', 'helloworld.liq.tz', '(Pair "hello world" 0)', 0).then(console.log).catch(console.log);
    // client.implicit(config.bootstrapRegistry, 'test', 'bootstrap1', 1337)
    //   .then(async registry => {
    //     // exec('sleep 2')
    //     await new Promise((r, _) => setTimeout(r, 250))
    //     return registry
    //   })
    //   .then(registry => client.balance(registry, 'test')).then(console.log)
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
    .action(() => shelljs_1.exec('sleep 6'))
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
    .action((glob, args) => test_1.test(compile, client_1.createClient(eztz_1.eztz, createTezosClient()), args, glob).then(() => process.exit(0)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUV2QyxtQ0FBa0M7QUFDbEMseUJBQXdCO0FBQ3hCLHlCQUF3QjtBQUN4QixxQ0FBb0M7QUFFcEMsNkRBQTZEO0FBQzdELG1DQUFzRDtBQUd0RCxxQ0FBdUM7QUFDdkMscUNBQThCO0FBQzlCLCtCQUEyQjtBQUMzQixpREFBcUM7QUFDckMsaUNBQTZCO0FBRTdCLE1BQU0sT0FBTyxHQUFHLHNCQUFjLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ25ELE1BQU0sYUFBYSxHQUFHLGNBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsUUFBUTtBQUNsRyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLGFBQWEsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQTtBQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0FBRWxGLG1DQUFtQztBQUNuQyxtQ0FBbUM7QUFDbkMsTUFBTSxpQkFBaUIsR0FBRyxHQUFnQixFQUFFO0lBQzFDLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ3hGLEtBQUssQ0FBQyxD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