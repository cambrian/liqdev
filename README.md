# liqdev
Swiss army knife for Liquidity development. Built for OSX, but could probably be adapted to any unix easily.

## Installation

Simply `npm install -g --production https://github.com/1protocol/liqdev.git`. This will install the `liqdev` command globally (as well as some other shell scripts with the `liqdev-` prefix, but you should only use these scripts via `liqdev` itself).

## Usage
* `liqdev setup` - Build Tezos and Liquidity. Do some minor but important configuration.
* `liqdev sandbox` - Run sandbox Tezos node and baker in background. Initialize client scripts.
* `liqdev build` - Compile contracts in file watcher mode.
* `liqdev test` - Build and test contracts.
* `liqdev deploy` - Deploy a contract to a Tezos network.

## Development

1. Clone this repo and `npm install`.
2. Do `npm run-script build` to refresh the executables from source.
3. Run `./dist/bin/liqdev.js` to test `liqdev`. This will use local copies of the shell scripts, even if you have `liqdev` installed globally as well.
