#!/bin/sh
cd ../demo-contract
echo "Enter new image version: "
read ver
docker build -t filedger/assetcc:$ver .
docker push filedger/assetcc:$ver