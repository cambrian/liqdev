#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("./config");
const fs = require("fs");
const os = require("os");
const program = require("commander");
const build_1 = require("./build");
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
    ? compile(contract + '.liq')
    : build_1.startWatcher(compile))
    .action(() => process.exit(0));
program
    .command('test [glob]')
    .description('test Liquidity files matching a glob pattern')
    .option('-g, --generate', 'generate or overwrite expected outputs')
    .action(verifySetup)
    .action(verifySandbox)
    .action((contractGlob, args) => test_1.test(compile, eztz_1.eztz, contractGlob, args))
    .action(() => process.exit(0));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxtQ0FBa0M7QUFDbEMseUJBQXdCO0FBQ3hCLHlCQUF3QjtBQUN4QixxQ0FBb0M7QUFFcEMsbUNBQXNEO0FBRXRELHFDQUE4QjtBQUM5QiwrQkFBMkI7QUFDM0IsaURBQXFDO0FBQ3JDLGlDQUE2QjtBQUU3QixNQUFNLE9BQU8sR0FBRyxzQkFBYyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUNuRCxNQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLFFBQVE7QUFDbEcsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxhQUFhLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUE7QUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQTtBQUVsRixpREFBaUQ7QUFDakQsV0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBRTdDLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRTtJQUN2QixNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM1RSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1FBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQTtRQUM1QyxPQUFPLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUE7UUFDbkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNoQjtBQUNILENBQUMsQ0FBQTtBQUVELE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtJQUN6QixNQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN4RSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7UUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzREFBc0QsQ0FBQyxDQUFBO1FBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7QUFDSCxDQUFDLENBQUE7QUFFRCxPQUFPO0tBQ0osT0FBTyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUM7S0FDakMsV0FBVyxDQUFDLDRDQUE0QyxDQUFDO0tBQ3pELEVBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkRBQTZELEVBQ3pFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDLENBQUMsQ0FBQTtBQUVKLE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxDQUFDO0tBQ2hCLFdBQVcsQ0FBQyw2QkFBNkIsQ0FBQztLQUMxQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEYsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLGdEQUFnRDtBQUVqRixPQUFPO0tBQ0osT0FBTyxDQUFDLFNBQVMsQ0FBQztLQUNsQixXQUFXLENBQUMsc0RBQXNELENBQUM7S0FDbkUsTUFBTSxDQUFDLFdBQVcsQ0FBQztLQUNuQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEYsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLHFCQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU07SUFDdkQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDN0UsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUVoQyxPQUFPO0tBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUNmLFdBQVcsQ0FBQyw2QkFBNkIsQ0FBQztLQUMxQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEYsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUVoQyxPQUFPO0tBQ0osT0FBTyxDQUFDLGtCQUFrQixDQUFDO0tBQzNCLFdBQVcsQ0FBQyx1REFBdUQsQ0FBQztLQUNwRSxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQ25CLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUTtJQUM1QixDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7SUFDNUIsQ0FBQyxDQUFDLG9CQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDekIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUVoQyxPQUFPO0tBQ0osT0FBTyxDQUFDLGFBQWEsQ0FBQztLQUN0QixXQUFXLENBQUMsOENBQThDLENBQUM7S0FDM0QsTUFBTSxDQUFDLGdCQUFnQixFQUFFLHdDQUF3QyxDQUFDO0tBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDbkIsTUFBTSxDQUFDLGFBQWEsQ0FBQztLQUNyQixNQUFNLENBQUMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFJLENBQUMsT0FBTyxFQUFFLFdBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDdkUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUVoQyxPQUFPO0tBQ0osT0FBTyxDQUFDLFFBQVEsQ0FBQztLQUNqQixXQUFXLENBQUMsOENBQThDLENBQUM7S0FDM0QsTUFBTSxDQUFDLFdBQVcsQ0FBQztLQUNuQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEYsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUVoQyxPQUFPO0tBQ0osS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUV0Qix3QkFBd0I7QUFDeEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7Q0FDaEIifQ==