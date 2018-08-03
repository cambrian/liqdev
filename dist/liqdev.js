#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
// TODO: Fill in the EZTZ typings.
const eztz = require("eztz");
const fs = require("fs");
const os = require("os");
const program = require("commander");
const build_1 = require("@src/build");
const shelljs_1 = require("shelljs");
const test_1 = require("@src/test");
const compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm';
const compile = build_1.createCompiler(compilerPath);
const verifySetup = () => {
    const compilerPathAbsolute = compilerPath.replace(/^~/, os.homedir());
    if (!fs.existsSync(compilerPathAbsolute)) {
        console.log('Liquidity compiler not found.');
        console.error('You must run setup before running any other tasks.');
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
    // Decide whether to use global or local scripts based on command name.
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-setup' : './lib/setup.sh'));
program
    .command('sandbox')
    .description('run sandbox Tezos network (node, client, and baker)')
    .action(verifySetup)
    .action(() => shelljs_1.exec(process.argv[0] === 'liqdev' ? 'liqdev-sandbox' : './lib/sandbox.sh'));
program
    .command('build [contract]')
    .description('compile Liquidity contracts (omit parameter to watch)')
    .action(verifySetup)
    .action((contract) => contract
    ? compile(contract + '.liq')
    : build_1.startWatcher(compile));
program
    .command('test [glob]')
    .description('test Liquidity files matching a glob pattern')
    .option('-g, --generate', 'generate or overwrite expected outputs')
    .action(verifySetup)
    .action((contractGlob, args) => test_1.test(compile, eztz, contractGlob, args.generate));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtBQUVoQyxrQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLHlCQUF3QjtBQUN4Qix5QkFBd0I7QUFDeEIscUNBQW9DO0FBRXBDLHNDQUF5RDtBQUV6RCxxQ0FBOEI7QUFDOUIsb0NBQWdDO0FBRWhDLE1BQU0sWUFBWSxHQUFHLHFEQUFxRCxDQUFBO0FBQzFFLE1BQU0sT0FBTyxHQUFHLHNCQUFjLENBQUMsWUFBWSxDQUFDLENBQUE7QUFFNUMsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFO0lBQ3ZCLE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDckUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsRUFBRTtRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUE7UUFDNUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFBO1FBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7QUFDSCxDQUFDLENBQUE7QUFFRCxPQUFPO0tBQ0osT0FBTyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUM7S0FDakMsV0FBVyxDQUFDLDRDQUE0QyxDQUFDO0tBQ3pELEVBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkRBQTZELEVBQ3pFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDLENBQUMsQ0FBQTtBQUVKLE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxDQUFDO0tBQ2hCLFdBQVcsQ0FBQyw2QkFBNkIsQ0FBQztJQUMzQyx1RUFBdUU7S0FDdEUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7QUFFdkYsT0FBTztLQUNKLE9BQU8sQ0FBQyxTQUFTLENBQUM7S0FDbEIsV0FBVyxDQUFDLHFEQUFxRCxDQUFDO0tBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDbkIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQTtBQUUzRixPQUFPO0tBQ0osT0FBTyxDQUFDLGtCQUFrQixDQUFDO0tBQzNCLFdBQVcsQ0FBQyx1REFBdUQsQ0FBQztLQUNwRSxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQ25CLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUTtJQUM1QixDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7SUFDNUIsQ0FBQyxDQUFDLG9CQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUU1QixPQUFPO0tBQ0osT0FBTyxDQUFDLGFBQWEsQ0FBQztLQUN0QixXQUFXLENBQUMsOENBQThDLENBQUM7S0FDM0QsTUFBTSxDQUFDLGdCQUFnQixFQUFFLHdDQUF3QyxDQUFDO0tBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDbkIsTUFBTSxDQUFDLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsV0FBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO0FBRW5GLE9BQU87S0FDSixPQUFPLENBQUMsUUFBUSxDQUFDO0tBQ2pCLFdBQVcsQ0FBQyw4Q0FBOEMsQ0FBQztLQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQ25CLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7S0FDaEUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7QUFFekYsT0FBTztLQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFdEIsd0JBQXdCO0FBQ3hCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMzRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQ2hCIn0=