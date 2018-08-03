#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
const program = require("commander");
const build_1 = require("@src/build");
const shelljs_1 = require("shelljs");
const chokidar_1 = require("chokidar");
const verifySetup = () => {
    // if (!fs.existsSync('~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm')) {
    //   console.error('You must run setup before running any other tasks.')
    //   process.exit(1)
    // }
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
    // Decide whether to use global or local scripts based on command name.
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/setup.sh'));
// TODO: Make commands error gracefully if setup has not been run?
program
    .command('sandbox')
    .description('run sandbox Tezos network (node, client, and baker)')
    .action(verifySetup)
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-sandbox' : './lib/sandbox.sh'));
program
    .command('build [contract]')
    .description('compile Liquidity contracts (omit parameter to watch)')
    .action(verifySetup)
    .action((contract, args) => contract
    ? build_1.Build.compile(contract, shelljs_1.exec)
    : build_1.Build.startWatcher(chokidar_1.watch, shelljs_1.exec));
program
    .command('deploy')
    .description('deploy contract to any of the tezos networks')
    .action(verifySetup)
    .action(() => console.log('This command is still experimental.'))
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-deploy' : './lib/deploy.sh'));
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error('No task provided.\nSee --help for available tasks.', program.args.join(' '));
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtBQUdoQyxxQ0FBb0M7QUFFcEMsc0NBQWtDO0FBQ2xDLHFDQUE4QjtBQUM5Qix1Q0FBZ0M7QUFFaEMsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFO0lBQ3ZCLCtFQUErRTtJQUMvRSx3RUFBd0U7SUFDeEUsb0JBQW9CO0lBQ3BCLElBQUk7QUFDTixDQUFDLENBQUE7QUFFRCxPQUFPO0tBQ0osT0FBTyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUM7S0FDakMsV0FBVyxDQUFDLDRDQUE0QyxDQUFDO0tBQ3pELEVBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkRBQTZELEVBQ3pFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDLENBQUMsQ0FBQTtBQUVKLE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxDQUFDO0tBQ2hCLFdBQVcsQ0FBQyw2QkFBNkIsQ0FBQztJQUMzQyx1RUFBdUU7S0FDdEUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7QUFFdkYsa0VBQWtFO0FBRWxFLE9BQU87S0FDSixPQUFPLENBQUMsU0FBUyxDQUFDO0tBQ2xCLFdBQVcsQ0FBQyxxREFBcUQsQ0FBQztLQUNsRSxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQ25CLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7QUFFM0YsT0FBTztLQUNKLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztLQUMzQixXQUFXLENBQUMsdURBQXVELENBQUM7S0FDcEUsTUFBTSxDQUFDLFdBQVcsQ0FBQztLQUNuQixNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxRQUFRO0lBQ2xDLENBQUMsQ0FBQyxhQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxjQUFJLENBQUM7SUFDL0IsQ0FBQyxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsZ0JBQUssRUFBRSxjQUFJLENBQUMsQ0FBQyxDQUFBO0FBRXRDLE9BQU87S0FDSixPQUFPLENBQUMsUUFBUSxDQUFDO0tBQ2pCLFdBQVcsQ0FBQyw4Q0FBOEMsQ0FBQztLQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQ25CLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7S0FDaEUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7QUFFekYsT0FBTztLQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFdEIsd0JBQXdCO0FBQ3hCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMzRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQ2hCIn0=