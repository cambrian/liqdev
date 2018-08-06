#!/bin/bash
# Run me before client.
# RUn me after kill.
LIQDEV_DIR=${1:-~/.liqdev}

LOGDIR=logs
SANDBOX_LOGDIR=sandbox
BAKER_LOG=baker.log
NODE_LOG=node.log

cd $LIQDEV_DIR
mkdir -p $LOGDIR
rm -f $LOGDIR/$SANDBOX_LOGDIR/*
mkdir -p $LOGDIR/$SANDBOX_LOGDIR

echo "Starting sandboxed node."
./liquidity/tezos/src/bin_node/tezos-sandboxed-node.sh 1 --connections 1 > $LOGDIR/$SANDBOX_LOGDIR/$NODE_LOG 2>&1 &
sleep 2 # Avoid race conditions with node.

echo "Initializing sandboxed client for starting baker."
shopt -s expand_aliases # Expose aliases in the shell script.
eval `./liquidity/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1`
tezos-activate-alpha

# Dumb way of parsing local node dir from logs.
# Please replace with a better solution if you can think of one...
IDFILE=$(awk '/Stored the new identity/{print $NF}' $LOGDIR/$SANDBOX_LOGDIR/$NODE_LOG)
DIRPART=$(dirname $IDFILE)
NODEDIR=${DIRPART:1} # How to one-line this with ^?

echo "Starting baker."
echo "VERY IMPORTANT: THE BAKER MAY DIE IF YOU CLOSE THIS TERMINAL."
echo "If you ran liqdev locally, run [source ./lib/client.sh] to finish setup."
echo "If you ran liqdev globally, run [source liqdev-client] to finish setup."
echo "Hit enter to confirm you read this message."

# the [-002-PsYLVpVv] appears to be deterministic. shitty but it works.
# Debug Full Command: echo tezos-baker-002-PsYLVpVv run with local node $NODEDIR
tezos-baker-002-PsYLVpVv run with local node $NODEDIR > $LOGDIR/$SANDBOX_LOGDIR/$BAKER_LOG 2>&1
