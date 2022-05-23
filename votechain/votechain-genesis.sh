#!/bin/sh

./target/release/votechain \
--base-path /tmp/votechain \
--chain ./chainSpecLocal.json \
--$1 \
--port 30333 \
--ws-port 9944 \
--rpc-port 9933 \
--node-key 0000000000000000000000000000000000000000000000000000000000000001 \
--validator
