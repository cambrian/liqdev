#!/bin/bash
# Used to find tezos-client.
# FQP is the last line of stdout.

shopt -s expand_aliases # Expose aliases in the shell script.
eval `~/.liqdev/liquidity/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1`
type tezos-client | tr ' ' '\n' | tail -1
