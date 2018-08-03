#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
// TODO: Fill in EZTZ typings.
const eztz = require("eztz");
const fs = require("fs");
const os = require("os");
const program = require("commander");
const build_1 = require("@src/build");
const shelljs_1 = require("shelljs");
const chokidar_1 = require("chokidar");
console.log(typeof eztz);
const verifySetup = () => {
    const compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm'
        .replace(/^~/, os.homedir());
    if (!fs.existsSync(compilerPath)) {
        console.log('Liquidity compiler not found.');
        console.error('You must run setup before running any other tasks.');
        process.exit(1);
    }
};
// Some default paths/constants; in the future these may be options.
const compiler = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm';
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
    .action((contract, args) => contract
    ? build_1.Build.compile(shelljs_1.exec, compiler, contract + '.liq')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL2xpcWRldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtBQUVoQyw4QkFBOEI7QUFDOUIsNkJBQTRCO0FBQzVCLHlCQUF3QjtBQUV4Qix5QkFBd0I7QUFDeEIscUNBQW9DO0FBRXBDLHNDQUFrQztBQUNsQyxxQ0FBOEI7QUFDOUIsdUNBQWdDO0FBRWhDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQTtBQUN4QixNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUU7SUFDdkIsTUFBTSxZQUFZLEdBQUcscURBQXFEO1NBQ3ZFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDOUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUU7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO1FBQzVDLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtRQUNuRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2hCO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsb0VBQW9FO0FBQ3BFLE1BQU0sUUFBUSxHQUFHLHFEQUFxRCxDQUFBO0FBRXRFLE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQztLQUNqQyxXQUFXLENBQUMsNENBQTRDLENBQUM7S0FDekQsRUFBRSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7SUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw2REFBNkQsRUFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLENBQUMsQ0FBQyxDQUFBO0FBRUosT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLENBQUM7S0FDaEIsV0FBVyxDQUFDLDZCQUE2QixDQUFDO0lBQzNDLHVFQUF1RTtLQUN0RSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQTtBQUV2RixPQUFPO0tBQ0osT0FBTyxDQUFDLFNBQVMsQ0FBQztLQUNsQixXQUFXLENBQUMscURBQXFELENBQUM7S0FDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQztLQUNuQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFBO0FBRTNGLE9BQU87S0FDSixPQUFPLENBQUMsa0JBQWtCLENBQUM7S0FDM0IsV0FBVyxDQUFDLHVEQUF1RCxDQUFDO0tBQ3BFLE1BQU0sQ0FBQyxXQUFXLENBQUM7S0FDbkIsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUTtJQUNsQyxDQUFDLENBQUMsYUFBSyxDQUFDLE9BQU8sQ0FBQyxjQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsR0FBRyxNQUFNLENBQUM7SUFDbEQsQ0FBQyxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsZ0JBQUssRUFBRSxjQUFJLENBQUMsQ0FBQyxDQUFBO0FBRXRDLE9BQU87S0FDSixPQUFPLENBQUMsUUFBUSxDQUFDO0tBQ2pCLFdBQVcsQ0FBQyw4Q0FBOEMsQ0FBQztLQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQ25CLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7S0FDaEUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7QUFFekYsT0FBTztLQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFdEIsd0JBQXdCO0FBQ3hCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMzRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQ2hCIn0=