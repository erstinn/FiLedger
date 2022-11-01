'use strict';
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
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const adminDB = nano.db.use('admins');
const userDB = nano.db.use('users');
const approverDB = nano.db.use('approvers');
// const walletDB = nano.db.use('wallet');

const userViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented

router.get('/', function (req, res){
    res.render("registration", {dep: departments});
})


router.post("/status", async function (req, res){
    const lastName = req.body.lastname;
    const firstName = req.body.firstname;
    const email = req.body.email;
    const password = req.body.password;
    const uploader = req.body.isUploader;
    const dept = req.body.dept; //this works now
    const approver = req.body.isApprover;
    const admin = req.body.isAdmin;

    //generate id
    let uuid = await nano.uuids(1);
    let id = uuid.uuids[0];
    //generate for enrolled admin username
    const usernameAdmin = generateFromEmail(
        email,
        3
    );
    //generate for registered user
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


    const admin_username = usernameAdmin;
    //todo uncomment later sry mizi
    const ccpPath = path.resolve("./network/try-k8/", "connection-org.yaml");
    if (ccpPath.includes(".yaml")) {
        ccp = yaml.load(fs.readFileSync(ccpPath, 'utf-8'));
    } else {
        ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    }
    //TODO ENROLLMENT AS ADMIN
    if(admin==='on') {
        async function enroll() {
            console.log("admin enrollment ")
            try {
                // Create a new CA client for interacting with the CA.
                const caInfo = ccp.certificateAuthorities[caURL];
                const caTLSCACerts = caInfo.tlsCACerts.pem;
                const ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);

                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet', mspId);
                const wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "wallet");
                console.log(`Wallet path: ${walletPath}`); //dno if irrelevant if couchdb code

                // Check to see if we've already enrolled the admin user.
                const identity = await wallet_admin.get(adminid);
                if (identity) {
                    console.log(`An identity for the admin user '${admin_username}' already exists in the wallet`);
                    return;
                }

                // Enroll the admin user, and import the new identity into the wallet.
                const enrollment = await ca.enroll({enrollmentID: adminid, enrollmentSecret: adminpw});
                const x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                    },
                    mspId: mspId,
                    type: 'X.509',
                };
                await wallet_admin.put(adminid, x509Identity);
                await adminDB.insert({
                    _id: id,
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                    username: admin_username,
                    password: SHA1(password).toString(enc.Hex),
                    department: dept,
                    add_doc: uploader,
                    admin: admin
                })
                console.log(`Successfully enrolled admin user '${admin_username}'and imported it into the wallet`);
                res.render('success-reg');
                console.log(admin);
            } catch (error) {
                console.error(`Failed to enroll admin user ${admin_username}: ${error}`);
                process.exit(1);
                res.render('failure-reg');

            }
        }

        await enroll();
    }else {
        //TODO REGISTER AND ENROLL USER
        async function register() {
            try {
                console.log("user enrollment ")
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet', mspId);
                const wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "wallet");
                const wallet_users = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "wallet_users");
                console.log(`Wallet path: ${walletPath}`);

                // Create a new CA client for interacting with the CA.
                const caInfo = ccp.certificateAuthorities[caURL];
                const caTLSCACerts = caInfo.tlsCACerts.pem;
                const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

                // Check to see if we've already enrolled the user.
                const userIdentity = await wallet_users.get(username);
                if (userIdentity) {
                    console.log(`An identity for the user ${username} already exists in the wallet`);
                    return;
                }

                // Check to see if we've already enrolled the admin user.
                //TODO: need icheck if sinong admin or kaninong account yung nag-reregister ng user (idk if need pa to)
                const adminIdentity = await wallet_admin.get(adminid);
                if (!adminIdentity) {
                    console.log(`An identity for the admin user ${adminid} does not exist in the wallet`);
                    console.log('Run the enrollAdmin.js application before retrying');
                    return;
                }

                // build a user object for authenticating with the CA
                const provider = wallet_admin.getProviderRegistry().getProvider(adminIdentity.type);
                const adminUser = await provider.getUserContext(adminIdentity, admin_username);

                // Register the user, enroll the user, and import the new identity into the wallet.
                const secret = await ca.register({
                    // affiliation: 'org1.'+dept,
                    enrollmentID: username,
                    role: 'client'
                }, adminUser);
                const enrollment = await ca.enroll({
                    enrollmentID: username,
                    enrollmentSecret: secret
                });
                const x509Identity = {
                    credentials: {
                        certificate: enrollment.certificate,
                        privateKey: enrollment.key.toBytes(),
                    },
                    mspId: 'Org1MSP',
                    type: 'X.509',
                };
                await wallet_users.put(username, x509Identity);
                console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);
                if(approver=='on'){
                    await approverDB.insert({
                        _id: id,
                        firstname: firstName,
                        lastname: lastName,
                        email: email,
                        username: username,
                        password: SHA1(password).toString(enc.Hex),
                        department: dept,
                        def_approver:approver|| "off"
                    })
                }else {
                    await userDB.insert({
                        _id: id,
                        firstname: firstName,
                        lastname: lastName,
                        email: email,
                        username: username,
                        password: SHA1(password).toString(enc.Hex),
                        department: dept,
                        add_doc: uploader || "off",
                    })
                }
                res.render('success-reg');
            }catch (error) {
                    console.error(`Failed to register user ${username}: ${error}`);
                    process.exit(1);
                    res.render('failure-reg');
                }
        }
        await register();
    }


})


module.exports = router