"use strict";

const { Gateway, Wallets } = require("fabric-network");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const mspId = "Org1MSP";
const CC_NAME="assetcc";
const CHANNEL="mychannel";
let ccp = null;

exports.log = async function(req, res) {
    console.log("invoke log")
    return "SUCCESS"
}

async function invokeTransaction (fileName, fileType, fileSize, fileTagsList,
                                  fileVersion, stateTimestampList, fileCreator, fileMinApprovers) {

    var result = "";
    var user = "testuser";
    // var docdeets = '';
    // var docdeets = localStorage.getItem('docdeets');
    // app.get('/dashboard/upload',(req,res)=>{
    //     // console.log(req.docdeets);
    //     res.docdeets = req.docdeets;
    // })
    console.log('ANG LAMAN NG DOCDEETS AY: ');

    try {
        console.log("Invoking chaincode using : ", user);
        // load the network configuration
        const ccpPath = path.resolve(
            __dirname,
            "connection-org.yaml"
        );
        if (ccpPath.includes(".yaml")) {
            ccp = yaml.load(fs.readFileSync(ccpPath, "utf8"));
        } else {
            ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
        }

        // Create a new file system based wallet for managing identities.
        // const walletPath = path.join(process.cwd(), 'wallet', mspId);
        // const wallet = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/',"wallet");
        // console.log(`Wallet path: ${walletPath}`);

        const walletPath = "/Users/danafayehuang/Desktop/College Thingz/Thesis Code Repo/FiLedger/network/wallet";
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log(
                `An identity for the user "${user}" does not exist in the wallet`
            );
            console.log("Run the registerUser.js application before retrying");
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
        // const tokenId=Math.floor((Math.random() * 100) + 1)+Math.floor((Math.random() * 100) + 1);

        const tokenId=(Math.floor(Math.random()));
        await contract.submitTransaction(
            "createDoc",
            `123213`, fileName, fileType, fileSize, fileTagsList,
            fileVersion, stateTimestampList, fileCreator, fileMinApprovers,
        );
        console.log("Transaction has been submitted");

        result = 'Transaction has been submitted';


        // let result = await contract.evaluateTransaction("getAllDocs");
        console.log(result)
        // localStorage.removeItem('docdeets');
        // Disconnect from the gateway.
        gateway.disconnect();
        return result;
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        result = `Failed to submit transaction: ${error}`;

    }
    // return result;
}
module.exports = {invokeTransaction};

