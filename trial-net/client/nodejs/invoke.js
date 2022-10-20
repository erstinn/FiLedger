
'use strict';

const { Gateway, Wallets } = require('fabric-network');
const yaml = require("js-yaml");
const fs = require('fs');
const path = require('path');
const mspId = "Org1MSP";
const CC_NAME = "fabcar";
const CHANNEL = "mychannel";
let ccp = null;

async function invoke(user) {
    try {
        // 
        // const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        // let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        console.log("Invoking chaincode using : ", user);
        // load the network configuration
        const ccpPath = path.resolve(__dirname, "connection-org.yaml");
        if (ccpPath.includes(".yaml")){
            ccp = yaml.load(fs.readFile(ccpPath, "utf-8"));
        } else {
            ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        }
        
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet', mspId);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user);
        if (!identity) {
            console.log('An identity for the user "${user}" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
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

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
invoke("appUser")