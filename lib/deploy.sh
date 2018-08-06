#!/bin/bash
# NOTE: DO NOT USE YET. ALPHA.
# A friendly script to help you deploy.
# TODO: Network selection.

echo "Liqdev Contract Deployer"
echo "NOTE: This command is still experimental."
read -e -p "Path To Contract: " CONTRACT

# Use contract filename (no extension) as default value for contract alias.
CONTRACT_FILENAME=$(basename $CONTRACT | cut -d. -f1)
read -p "Contract Name ($CONTRACT_FILENAME): " CONTRACT_NAME
CONTRACT_NAME="${CONTRACT_NAME:-$CONTRACT_FILENAME}"
read -p "Originating Account: " ACCOUNT
read -p "Amount To Transfer (2.01)" AMT
AMT="${AMT:-2.01}"

# Read init data file if available.
INIT_FILENAME=${CONTRACT/.tz/.init.tz}
if [ -f $INIT_FILENAME ]; then
  FOUND_INIT=$(<$INIT_FILENAME)
  read -p "Init Data (leave empty to use $INIT_FILENAME): " INIT
  INIT="${INIT:=$FOUND_INIT}"
else
  read -p "Init data not found. Please provide: " INIT
fi

echo "Executing: "
echo tezos-client originate contract $CONTRACT_NAME for $ACCOUNT transferring $AMT from $ACCOUNT \
     running $CONTRACT --init '$INIT'
~/.liqdev/liquidity/tezos/tezos-client originate contract $CONTRACT_NAME for $ACCOUNT transferring \
                                       $AMT from $ACCOUNT running $CONTRACT --init '$INIT'
