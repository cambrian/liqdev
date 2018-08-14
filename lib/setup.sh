#!/bin/bash
if ! [ -x "$(command -v brew)" ]
then
  echo 'Installing Homebrew.'
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi
brew tap ocaml/ocaml
brew install git opam@2 libsodium libffi pandoc libev pkg-config
export OPAMYES=true # Spooky.
opam init --no-setup --enable-shell-hook
if [ -d ~/.liqdev/liquidity/tezos/_opam ]
then
  echo "Existing liqdev setup found. Keeping Tezos OCaml switch."
  rm -rf ~/.liqdevtezosopam
  mv ~/.liqdev/liquidity/tezos/_opam ~/.liqdevtezosopam
fi
rm -rf ~/.liqdev
mkdir ~/.liqdev
cd ~/.liqdev
git clone https://github.com/OCamlPro/liquidity.git
cd liquidity
make clone-tezos
if [ -d ~/.liqdevtezosopam ]
then
  mv ~/.liqdevtezosopam ~/.liqdev/liquidity/tezos/_opam
fi

# Make clone-tezos sets up an ocaml switch strictly
# for building tezos (has a minimal package list).
sed -i '.bak' -e 's/\~rc3//g' tezos/scripts/version.sh
make -C tezos build-deps
eval $(opam env --set-switch --switch=$PWD/tezos)
make -C tezos

# Avoid some spooky errors...
./tezos/tezos-node identity generate 26

# Configure tezos-sandboxed-node to allow CORS requests.
sed -i '.bak' -e 's/"$expected_connections"/"$expected_connections" --cors-origin=*/g' tezos/src/bin_node/tezos-sandboxed-node.sh

# We need another OCaml switch to build liquidity.
opam switch create 4.06.1
eval $(opam env --set-switch --switch=4.06.1)
opam install ocp-build zarith ocplib-json-typed ocplib-endian calendar ocurl \
             lwt.3.3.0 bigstring digestif ezjsonm sodium cstruct-async cstruct-lwt \
             ppx_cstruct cstruct-unix ctypes-foreign ppx_deriving
make
make install

# Configure [make tests] to use a local sandbox.
sed -i '.bak' -e '/TEZOS_ARGS/s/# //g' config.sh
make tests
