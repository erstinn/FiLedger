#!/bin/sh
cd ../demo-contract
echo "Enter new image version: "
read ver
docker build -t dnahng/assetcc:$ver .
docker push dnahng/assetcc:$ver