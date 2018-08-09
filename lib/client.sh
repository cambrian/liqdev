#!/bin/bash
# Source me after baker.
LIQDEV_DIR=${1:-~/.liqdev}

cd $LIQDEV_DIR
sleep 4 # Avoid race conditions with baker.
echo "Initializing sandboxed client."
shopt -s expand_aliases # Expose aliases in the shell script.
eval `./liquidity/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1 2>/dev/null`
cd - >/dev/null 2>&1
