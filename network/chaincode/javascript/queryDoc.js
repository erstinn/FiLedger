/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const yaml = require("js-yaml");
const mspId = "Org1MSP";
const CC_NAME="assetcc";
const CHANNEL="mychannel";
let ccp = null;

let queryDoc = async function main(user, isAdmin, isApprov, Org, id) {
    var dbName = '';
    var org = ''
    var userType = '';

    if(Org == 'org1'){
        org = 'org1'
    }
    else if(Org == 'org2'){
        org = 'org2'
    }

    if(isAdmin === true){
        userType = 'admins'
    }
    else if(isApprov === true){
        userType = 'approvers'
    }
    else{
        userType = 'users'
    }

    dbName = org + '-wallet_' + userType;
    console.log(dbName, "!!!!!");


    var wallet = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', dbName);

    try {
        console.log("Invoking chaincode using :", user);
        // load the network configuration
        const ccpPath = path.resolve("./network/cluster", "connection-org.yaml");
        if (ccpPath.includes(".yaml")) {
            ccp = yaml.load(fs.readFileSync(ccpPath, "utf8"));
        } else {
            ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
        }


        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(`An identity for the user ${user} does not exist in the wallet`);
            console.log('Register the user');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: user,
            discovery: { enabled: true, asLocalhost: false }
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(CHANNEL);

        // Get the contract from the network.
        const contract = network.getContract(CC_NAME);

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('readDoc', id);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
module.exports = { queryDoc };
