#!/bin/zsh
cd ~/.liqdev
mkdir -p logs
rm -f logs/*
nohup ./liquidity/tezos/src/bin_node/tezos-sandboxed-node.sh 1 --connections 1 > logs/tezos-sandboxed-node.log &
sleep 2
shopt -s expand_aliases # Allow this script to access the sandboxed client aliases
eval `./liquidity/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1`
tezos-activate-alpha
tezos-autocomplete
# dumb way of parsing local node dir from logs
# pls replace with a better soln if you can think of one
IDFILE=$(awk '/Stored the new identity/{print $NF}' logs/tezos-sandboxed-node.log)
DIRPART=$(dirname $IDFILE)
NODEDIR=${DIRPART:1} # how to one-line this with ^?
# the [-002-PsYLVpVv] appears to be deterministic. shitty but it works.
# this is bugged. halp. The ampersand causes the $NODEDIR path to be different for some reason.
nohup tezos-baker-002-PsYLVpVv run with local node $NODEDIR > logs/tezos-baker.log &
