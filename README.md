# liqdev
Swiss army knife for Liquidity development. Built for OSX, but could probably be adapted to any unix easily.

## Installation

Simply `npm install -g --production https://github.com/1protocol/liqdev.git`. This will install the `liqdev` command globally (as well as some other shell scripts with the `liqdev-` prefix, but you should only use these scripts via `liqdev` itself).

## Usage
* `liqdev setup` - Download & build tezos and liquidity. Do some minor but important configuration.
* `liqdev sandbox` - Run sandbox tezos node, client, and baker (in foreground)
* `liqdev build` - Compile contracts in file watcher mode
* `liqdev test` - Build & test contracts
* `liqdev deploy` - Deploy a contract to a tezos network.

## Development

1. Clone this repo and `npm install`.
2. Do `npm run-script build` to refresh the executables from source.
3. Run `./dist/liqdev.js` to test `liqdev`. This will use local copies of the shell scripts, even if you have `liqdev` installed globally as well.
