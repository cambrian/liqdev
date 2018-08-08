#!/bin/bash
# Source me after baker.
LIQDEV_DIR=${1:-~/.liqdev}

LOGDIR=logs
SANDBOX_LOGDIR=sandbox
CLIENT_LOG=client.log
TEZOS_CLIENT_PATHFILE=.tezos-client-path

cd $LIQDEV_DIR
mkdir -p $LOGDIR
rm -f $LOGDIR/$SANDBOX_LOGDIR/*
mkdir -p $LOGDIR/$SANDBOX_LOGDIR

sleep 4 # Avoid race conditions with baker.
echo "Initializing sandboxed client."
shopt -s expand_aliases # Expose aliases in the shell script.
eval `./liquidity/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1`
type tezos-client | tr ' ' '\n' | tail -1 > $LIQDEV_DIR/$TEZOS_CLIENT_PATHFILE
cd - > /dev/null 2>&1
