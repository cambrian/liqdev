#!/bin/bash
if ! [ -x "$(command -v brew)" ]; then
  echo 'Installing Homebrew.'
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi
brew tap ocaml/ocaml
brew install git opam@2 libsodium libffi pandoc
opam init --no-setup --enable-shell-hook
mkdir ~/.liqdev && cd ~/.liqdev
git clone https://github.com/OCamlPro/liquidity.git
cd liquidity
make clone-tezos
# Make clone-tezos sets up an ocaml switch strictly
# for building tezos (has a minimal package list)
sed -i '.bak' -e 's/\~rc3//g' tezos/scripts/version.sh
make -C tezos build-deps
eval $(opam env --set-switch --switch=$PWD/tezos)
make -C tezos
# Configure tezos-sandboxed-node to allow cors requests
sed -i '.bak' -e 's/"$expected_connections"/"$expected_connections" --cors-origin=*/g' tezos/src/bin_node/tezos-sandboxed-node.sh
# We need another ocaml switch to build liquidity
opam switch create 4.06.1
eval $(opam env --set-switch --switch=4.06.1)
opam install ocp-build zarith ocplib-json-typed ocplib-endian calendar ocurl \
             lwt.3.3.0 bigstring digestif ezjsonm sodium cstruct-async cstruct-lwt \
             ppx_cstruct cstruct-unix ctypes-foreign ppx_deriving
make
make install
# Configure [make tests] to use a local sandbox
sed -i '.bak' -e '/TEZOS_ARGS/s/# //g' config.sh
make tests