#!/bin/sh

./target/release/substrate \
--base-path /tmp/substrate \
--chain local \
--$1 \
--port 30333 \
--ws-port 9944 \
--rpc-port 9933 \
--node-key 0000000000000000000000000000000000000000000000000000000000000001 \
--validator
