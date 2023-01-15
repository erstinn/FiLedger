"use strict";

const { Gateway, Wallets } = require("fabric-network");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const mspId = "Org1MSP";
const CC_NAME="assetcc";
const CHANNEL="mychannel";
let ccp = null;
const serverip = '127.0.0.1';

exports.log = async function(req, res) {
    console.log("invoke log")
    return "SUCCESS"
}

async function invokeTransaction (user, isAdmin, isApprov, Org, id, fileName, fileType, fileSize, fileTagsList,
                                  fileVersion, stateTimestampList, fileCreator, status, dept) {

    var dbName = dbGen(isAdmin, isApprov, Org);

    var wallet = await Wallets.newCouchDBWallet(`http://admin:admin@${serverip}:5984/`, dbName);



    try {
        console.log("Invoking cREATE chaincode using :", user);
        // load the network configuration
        const ccpPath = path.resolve("./network/filedger-cluster", "connection-org.yaml");
        if (ccpPath.includes(".yaml")) {
            ccp = yaml.load(fs.readFileSync(ccpPath, "utf8"));
        } else {
            ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
        }



        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(
                `An identity for the user "${user}" does not exist in the wallet`
            );
            console.log("Register the user before retrying");
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: user,
            discovery: { enabled: true, asLocalhost: false },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(CHANNEL);

        // Get the contract from the network.
        const contract = network.getContract(CC_NAME);

        await contract.submitTransaction(
            "createDoc",
            id, fileName, fileType, fileSize, fileTagsList,
            fileVersion, stateTimestampList, fileCreator, status, dept
        );
        console.log("Transaction has been submitted");


        // let result = await contract.evaluateTransaction("getAllDocs");
        // localStorage.removeItem('docdeets');
        // Disconnect from the gateway.
        gateway.disconnect();
        // return result;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
    // return result;
}

async function updateTransaction(user, isAdmin, isApprov, Org, id, fileName, fileType, fileSize, fileTagsList,
                                 fileVersion, fileCreator, stateTimestamps, status, dept) {

    var dbName = dbGen(isAdmin, isApprov, Org);
    var wallet = await Wallets.newCouchDBWallet(`http://admin:admin@${serverip}:5984/`, dbName);

    try {
        console.log("Invoking UPDATE chaincode using :", user);
        // load the network configuration
        const ccpPath = path.resolve("./network/filedger-cluster", "connection-org.yaml");
        if (ccpPath.includes(".yaml")) {
            ccp = yaml.load(fs.readFileSync(ccpPath, "utf8"));
        } else {
            ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
        }



        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(
                `An identity for the user "${user}" does not exist in the wallet`
            );
            console.log("Register the user before retrying");
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: user,
            discovery: { enabled: true, asLocalhost: false },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(CHANNEL);

        // Get the contract from the network.
        const contract = network.getContract(CC_NAME);

        await contract.submitTransaction(
            "updateDocs",
            id, fileName, fileType, fileSize, fileTagsList,
            fileVersion, fileCreator, stateTimestamps, status, dept
        );
        console.log("Document has been updated in the ledger");



        // let result = await contract.evaluateTransaction("getAllDocs");

        gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);

    }
    // return result;
}

function dbGen(isAdmin, isApprov, Org){
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
    return dbName

}

module.exports = {invokeTransaction, updateTransaction};
