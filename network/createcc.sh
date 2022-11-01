#!/bin/sh
cd chaincode/javascript
echo "Enter new image version: "
read ver
docker build -t filedger/assetcc:$ver .
docker push filedger/assetcc:$ver

cd ./../../
kubectl hlf externalchaincode sync --image=filedger/assetcc:$ver --name=$CC_NAME --namespace=fabric --package-id=$PACKAGE_ID --tls-required=false --replicas=1
