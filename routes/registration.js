// const express = require('express')
// const {generateFromEmail} = require("unique-username-generator");
// const generator = require("generate-password");
// const SHA1  = require('crypto-js/sha1');
// const { enc } = require('crypto-js');
// const router = express.Router()
// //databases
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// // const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const userDB = nano.db.use('users');
// const userViews = "/_design/all_users/_view/all";
// const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented
//
// router.get('/', function (req, res){
//     res.render("registration", {dep: departments});
// })
//
// router.post("/status", async function (req, res){
//     const userName = req.body.username; //generated
//     const lastName = req.body.lastname;
//     const firstName = req.body.firstname;
//     const email = req.body.email;
//     const password = req.body.password; //generated
//     const admin = req.body.isAdmin;
//     const add_doc = req.body.add_doc;
//     const dept = req.body.dept; //this works now
//
//     //generate id
//     let uuid = await nano.uuids(1);
//     let id = uuid.uuids[0];
//
//     //generate username
//     const username = generateFromEmail(
//         email,
//         3
//     );
//
//     //generate default password
//     const passw = SHA1 (generator.generate({
//         length: 10,
//         numbers: true
//     })).toString(enc.Hex)
//
//     await userDB.insert({
//         _id: id,
//         firstname: firstName,
//         lastname: lastName,
//         email: email,
//         username: username,
//         password: passw,
//         department: dept,
//         add_doc: add_doc,
//         admin: admin
//     })
//
//     if(res.statusCode === 200){
//         res.render('success-reg');
//     }
//     else{
//         //not sure if need
//         res.render('failure-reg');
//     }
//
//     // console.log(dept, lname, fname, email, password, un, admin, add_doc);
//
// })
//
// module.exports = router

'use strict';
//made some comments - missy
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const yaml = require("js-yaml");
const fs = require('fs');
const path = require('path');
const { createConnection } = require('net');

const express = require('express')
const {generateFromEmail} = require("unique-username-generator");
const generator = require("generate-password");
const SHA1  = require('crypto-js/sha1');
const { enc } = require('crypto-js');
const router = express.Router()
//databases TODO delete test code later
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');
const userDB = nano.db.use('users');


const userViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented

router.get('/', function (req, res){
    res.render("registration", {dep: departments});
})


router.post("/status", async function (req, res){
    const userName = req.body.username; //generated
    const lastName = req.body.lastname;
    const firstName = req.body.firstname;
    const email = req.body.email;
    const password = req.body.password; //generated
    const admin = req.body.isAdmin;
    const add_doc = req.body.add_doc;
    const dept = req.body.dept; //this works now

    //generate id
    let uuid = await nano.uuids(1);
    let id = uuid.uuids[0];

    //generate username
    const username = generateFromEmail(
        email,
        3
    );

    //generate default password
    const passw = SHA1 (generator.generate({
        length: 10,
        numbers: true
    })).toString(enc.Hex)

    let mspId = "Org1MSP";
    const adminid = "enroll"; //enroll id (i think should be autogenerated?)
    const adminpw = "enrollpw"; //enroll secret (auto rin sana)
    const caURL = "org1-ca.fabric";
    let ccp;

    await userDB.insert({
        _id: id,
        firstname: firstName,
        lastname: lastName,
        email: email,
        username: username,
        password: passw,
        department: dept,
        add_doc: add_doc,
        admin: admin
    })

    if(res.statusCode === 200){
        res.render('success-reg');
    }
    else{
        //not sure if need
        res.render('failure-reg');
    }

    // console.log(dept, lname, fname, email, password, un, admin, add_doc);

    async function enroll() {
        try {
            // load the network configuration
            //todo uncomment later sry mizi
            // const ccpPath = path.resolve("/Users/miciella/Documents/GitHub/Blockchain-based-DMS/trial-net/client/nodejs/","connection-org.yaml");
            const ccpPath = path.resolve("./trial-net/client/nodejs","connection-org.yaml");
            if (ccpPath.includes(".yaml")){
                ccp = yaml.load(fs.readFileSync(ccpPath,'utf-8'));
            } else {
                ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
            }

            // Create a new CA client for interacting with the CA.
            const caInfo = ccp.certificateAuthorities[caURL];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Create a new file system based wallet for managing identities.
            //TODO test bagin
            const walletPath = path.join(process.cwd(), 'wallet', mspId);
            // const wallet = await Wallets.newFileSystemWallet(walletPath);
            const wallet = await Wallets.newCouchDBWallet('http://admin:pw123@127.0.0.1:5984/',"users");
            // const wallet = await Wallets.newCouchDBWallet(nano,"users");
            //TODO test end
            console.log(`Wallet path: ${walletPath}`); //dno if irrelevant if couchdb code

            // Check to see if we've already enrolled the admin user.
            const identity = await wallet.get(adminid);
            if (identity) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }

            // Enroll the admin user, and import the new identity into the wallet.
            const enrollment = await ca.enroll({ enrollmentID: adminid, enrollmentSecret: adminpw });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspId,
                type: 'X.509',
            };
            await wallet.put('admin', x509Identity);
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

        } catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
            process.exit(1);
        }
    }

    await enroll();

})

module.exports = router

