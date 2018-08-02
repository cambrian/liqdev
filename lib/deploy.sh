#!/bin/bash
# A friendly script to help you deploy.
# TODO: network selection

echo "Liqdev contract deployer"
read -e -p "Path to contract: " contract

# Use contract filename (no extension) as default value for contract alias
contract_filename=$(basename $contract | cut -d. -f1)
read -p "Contract name ($contract_filename): " contract_name
contract_name="${contract_name:-$contract_filename}"

read -p "Originating account: " account

read -p "Amount to transfer (2.01)" amt
amt="${amt:-2.01}"

# Read init data file if available
init_filename=${contract/.tz/.init.tz}
if [ -f $init_filename ]; then
   found_init=$(<$init_filename)
   read -p "Init data (leave empty to use $init_filename): " init
   init="${init:=$found_init}"
else
   read -p "Init data not found. Please provide: " init
fi

echo "Executing: "
echo tezos-client originate contract $contract_name for $account transferring $amt from $account running $contract --init '$init'
~/.liqdev/liquidity/tezos/tezos-client originate contract $contract_name for $account transferring $amt from $account running $contract --init '$init'