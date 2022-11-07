#!/bin/sh
echo "Enter image version: "
read ver
docker build -t filedger/assetcc:$ver .
docker push filedger/assetcc:$ver
echo "Done pushing, updating now"
kubectl hlf externalchaincode sync --image=filedger/assetcc:$ver --name=$CC_NAME --namespace=fabric --package-id=$PACKAGE_ID --tls-required=false --replicas=1
