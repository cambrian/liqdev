#!/bin/bash
cd ~/.liqdev
mkdir -p logs
rm -f logs/*
# Possible todo: kill process running on 18731
./liquidity/tezos/src/bin_node/tezos-sandboxed-node.sh 1 --connections 1 > logs/tezos-sandboxed-node.log &
shopt -s expand_aliases # Allow this script to access the sandboxed client aliases
eval `./liquidity/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1`
tezos-activate-alpha
# dumb way of parsing local node dir from logs
# pls replace with a better soln if you can think of one
IDFILE=$(awk '/Stored the new identity/{print $NF}' logs/tezos-sandboxed-node.log)
DIRPART=$(dirname $IDFILE)
NODEDIR=${DIRPART:1} # how to one-line this with ^?
# the [-002-PsYLVpVv] appears to be deterministic. shitty but it works.
tezos-baker-002-PsYLVpVv run with local node $NODEDIR
# Running tezos-baker in the background is bugged. Something to do with permissions possibly? i.e.
# the tezos-baker tries to make and access
# /var/folders/3k/gd03t15s19s6zvgp1v7hg99w0000gn/T/tezos-tmp-client.XXXXXXXX.R2OBAFfJ/bin/tezos-baker-002-PsYLVpVv
# but I'm guessing is unable to mkdir
# We decided we don't need to run in the bg, but maybe this comment will help someone some day
