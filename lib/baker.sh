#!/bin/bash
# Run me before client.
# Run me after kill.
LIQDEV_DIR=${1:-~/.liqdev}

LOGDIR=logs
SANDBOX_LOGDIR=sandbox
BAKER_LOG=baker.log
NODE_LOG=node.log
TEZOS_CLIENT_PATHFILE=.tezos-client-path

CYAN='\033[0;36m'
NC='\033[0m'

cd $LIQDEV_DIR
mkdir -p $LOGDIR
rm -f $LOGDIR/$SANDBOX_LOGDIR/*
mkdir -p $LOGDIR/$SANDBOX_LOGDIR

echo "Starting sandboxed node..."
./liquidity/tezos/src/bin_node/tezos-sandboxed-node.sh 1 --connections 1 >$LOGDIR/$SANDBOX_LOGDIR/$NODE_LOG 2>&1 &
sleep 2 # Avoid race conditions with node.

echo "Initializing sandboxed client for starting baker..."
shopt -s expand_aliases # Expose aliases in the shell script.
eval `./liquidity/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1 2>/dev/null`
type tezos-client | tr ' ' '\n' | tail -1 >$LIQDEV_DIR/$TEZOS_CLIENT_PATHFILE
tezos-activate-alpha >/dev/null 2>&1

# Dumb way of parsing local node dir from logs.
# Please replace with a better solution if you can think of one...
IDFILE=$(awk '/Stored the new identity/{print $NF}' $LOGDIR/$SANDBOX_LOGDIR/$NODE_LOG)
DIRPART=$(dirname $IDFILE)
NODEDIR=${DIRPART:1} # How to one-line this with ^?

echo "Starting baker and moving process to background..."
echo -e "${CYAN}If you ran liqdev locally, run [source ./lib/client.sh] to access tezos-client."
echo -e "If you ran liqdev globally, run [source liqdev-client] to access tezos-client.${NC}"

# the [-002-PsYLVpVv] appears to be deterministic. shitty but it works.
# Debug Full Command: echo tezos-baker-002-PsYLVpVv run with local node $NODEDIR
tezos-baker-002-PsYLVpVv run with local node $NODEDIR >$LOGDIR/$SANDBOX_LOGDIR/$BAKER_LOG 2>&1
