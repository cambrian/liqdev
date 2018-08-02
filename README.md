# liqdev
Swiss army knife for Liquidity development.

## Installation

Simply `npm install -g --production https://github.com/1protocol/liqdev.git`. This will install the `liqdev` command globally (as well as some other shell scripts with the `liqdev-` prefix, but you should only use these scripts via `liqdev` itself).

## Usage
* `liqdev setup`
* `liqdev sandbox` - runs sandbox tezos node, client, and baker (in foreground)
* `liqdev build`
* `liqdev test`
* `liqdev deploy`

## Development

1. Clone this repo and `npm install`.
2. Do `npm run-script build` to refresh the executables from source.
3. Run `./dist/liqdev.js` to test `liqdev`. This will use local copies of the shell scripts, even if you have `liqdev` installed globally as well.
