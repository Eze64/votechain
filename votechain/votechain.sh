#!/bin/sh

./target/release/votechain \
--base-path /tmp/votechain \
--chain ./chainSpecLocal.json \
--$1 \
--port 30333 \
--ws-port 9944 \
--rpc-port 9933 \
--validator \
--bootnodes /ip4/$2/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp
