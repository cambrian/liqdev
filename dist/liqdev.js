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
    .action((cmd) => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/setup.sh'));
// TODO: Make commands error gracefully if setup has not been run?
program
    .command('sandbox')
    .description('run sandbox Tezos network (node, client, and baker)')
    .action((cmd) => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-sandbox' : './lib/sandbox.sh'));
program
    .command('build [contract]')
    .description('compile Liquidity contracts (omit parameter to watch)')
    .action((contract, args) => contract
    ? build_1.Build.compile(contract, shelljs_1.exec)
    : build_1.Build.startWatcher(chokidar_1.watch, shelljs_1.exec));
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '));
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtBQUVoQyxxQ0FBb0M7QUFFcEMsc0NBQWtDO0FBQ2xDLHFDQUE4QjtBQUM5Qix1Q0FBZ0M7QUFFaEMsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO0tBQ2pDLFdBQVcsQ0FBQyw0Q0FBNEMsQ0FBQztLQUN6RCxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDZEQUE2RCxFQUN6RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakIsQ0FBQyxDQUFDLENBQUE7QUFFSixPQUFPO0tBQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQztLQUNoQixXQUFXLENBQUMsNkJBQTZCLENBQUM7SUFDM0MsdUVBQXVFO0tBQ3RFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQTtBQUUxRixrRUFBa0U7QUFFbEUsT0FBTztLQUNKLE9BQU8sQ0FBQyxTQUFTLENBQUM7S0FDbEIsV0FBVyxDQUFDLHFEQUFxRCxDQUFDO0tBQ2xFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFBO0FBRTlGLE9BQU87S0FDSixPQUFPLENBQUMsa0JBQWtCLENBQUM7S0FDM0IsV0FBVyxDQUFDLHVEQUF1RCxDQUFDO0tBQ3BFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFFBQVE7SUFDbEMsQ0FBQyxDQUFDLGFBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLGNBQUksQ0FBQztJQUMvQixDQUFDLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxnQkFBSyxFQUFFLGNBQUksQ0FBQyxDQUFDLENBQUE7QUFFdEMsT0FBTztLQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFdEIsd0JBQXdCO0FBQ3hCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMzRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQ2hCIn0=