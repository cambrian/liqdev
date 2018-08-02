#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
const program = require("commander");
const build_1 = require("@src/build");
const shelljs_1 = require("shelljs");
const chokidar_1 = require("chokidar");
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
    // Decide whether to use global or local scripts based on command name.
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/setup.sh'));
// TODO: Make commands error gracefully if setup has not been run?
program
    .command('sandbox')
    .description('run sandbox Tezos network (node, client, and baker)')
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-sandbox' : './lib/sandbox.sh'));
program
    .command('build [contract]')
    .description('compile Liquidity contracts (omit parameter to watch)')
    .action((contract, args) => contract
    ? build_1.Build.compile(contract, shelljs_1.exec)
    : build_1.Build.startWatcher(chokidar_1.watch, shelljs_1.exec));
program
    .command('deploy')
    .description('deploy contract to any of the tezos networks')
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-deploy' : './lib/deploy.sh'));
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '));
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtBQUVoQyxxQ0FBb0M7QUFFcEMsc0NBQWtDO0FBQ2xDLHFDQUE4QjtBQUM5Qix1Q0FBZ0M7QUFFaEMsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO0tBQ2pDLFdBQVcsQ0FBQyw0Q0FBNEMsQ0FBQztLQUN6RCxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDZEQUE2RCxFQUN6RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakIsQ0FBQyxDQUFDLENBQUE7QUFFSixPQUFPO0tBQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQztLQUNoQixXQUFXLENBQUMsNkJBQTZCLENBQUM7SUFDM0MsdUVBQXVFO0tBQ3RFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFBO0FBRXZGLGtFQUFrRTtBQUVsRSxPQUFPO0tBQ0osT0FBTyxDQUFDLFNBQVMsQ0FBQztLQUNsQixXQUFXLENBQUMscURBQXFELENBQUM7S0FDbEUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQTtBQUUzRixPQUFPO0tBQ0osT0FBTyxDQUFDLGtCQUFrQixDQUFDO0tBQzNCLFdBQVcsQ0FBQyx1REFBdUQsQ0FBQztLQUNwRSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxRQUFRO0lBQ2xDLENBQUMsQ0FBQyxhQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxjQUFJLENBQUM7SUFDL0IsQ0FBQyxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsZ0JBQUssRUFBRSxjQUFJLENBQUMsQ0FBQyxDQUFBO0FBRXRDLE9BQU87S0FDSixPQUFPLENBQUMsUUFBUSxDQUFDO0tBQ2pCLFdBQVcsQ0FBQyw4Q0FBOEMsQ0FBQztLQUMzRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtBQUV6RixPQUFPO0tBQ0osS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUV0Qix3QkFBd0I7QUFDeEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7Q0FDaEIifQ==