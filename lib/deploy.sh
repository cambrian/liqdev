#!/bin/bash
# NOTE: DO NOT USE YET. ALPHA.
# A friendly script to help you deploy.
# TODO: Network selection.

echo "Liqdev Contract Deployer"
read -e -p "Path To Contract: " contract

# Use contract filename (no extension) as default value for contract alias.
contract_filename=$(basename $contract | cut -d. -f1)
read -p "Contract Name ($contract_filename): " contract_name
contract_name="${contract_name:-$contract_filename}"
read -p "Originating Account: " account
read -p "Amount To Transfer (2.01)" amt
amt="${amt:-2.01}"

# Read init data file if available.
init_filename=${contract/.tz/.init.tz}
if [ -f $init_filename ]; then
  found_init=$(<$init_filename)
  read -p "Init Data (leave empty to use $init_filename): " init
  init="${init:=$found_init}"
else
  read -p "Init data not found. Please provide: " init
fi

echo "Executing: "
echo tezos-client originate contract $contract_name for $account transferring $amt from $account \
     running $contract --init '$init'
~/.liqdev/liquidity/tezos/tezos-client originate contract $contract_name for $account transferring \
                                       $amt from $account running $contract --init '$init'
