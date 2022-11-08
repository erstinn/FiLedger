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
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
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
    const orgs = req.body.org;

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
    let mspId2 = "Org2MSP";
    const adminid = "enroll"; //enroll id (i think should be autogenerated?)
    const adminpw = "enrollpw"; //enroll secret (auto rin sana)
    const caURL = "org1-ca.fabric";
    const caURL2 = "org2-ca.fabric";
    let ccp;


    const admin_username = usernameAdmin;
    const ccpPath = path.resolve("./network/cluster/", "connection-org.yaml");
    if (ccpPath.includes(".yaml")) {
        ccp = yaml.load(fs.readFileSync(ccpPath, 'utf-8'));
    } else {
        ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    }

    //FUNCTIONS FOR ADMIN ENROLLMENT
    //org1 admin enrollment
    async function enroll() {
        console.log("admin enrollment for org1")
        try {
            // Create a new CA client for interacting with the CA.
            const caInfo = ccp.certificateAuthorities[caURL];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);

            // Create a new file system based wallet for managing identities.
            // const walletPath = path.join(process.cwd(), 'wallet', mspId);
            const wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_admins");
            // const wallet_admin2 = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_admins");
            // const wallet_admin = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet");
            // console.log(`Wallet path: ${walletPath}`); //dno if irrelevant if couchdb code

            // Check to see if we've already enrolled the admin user org1
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

            //org1
            await wallet_admin.put(adminid, x509Identity);
            await insertToAdminDB(id, firstName,lastName,email,admin_username,password,dept,uploader,admin,req.body.org);
            console.log(`Successfully enrolled admin user '${admin_username}'and imported it into the wallet`);
            res.render('success-reg');
            console.log(admin);
        } catch (error) {
            console.error(`Failed to enroll admin user ${admin_username}: ${error}`);
            process.exit(1);
            res.render('failure-reg');

        }
    }

    //org2 admin enrollment
    async function enroll2(){
        console.log("admin enrollment for org 2")
        try{
            const caInfo2 = ccp.certificateAuthorities[caURL2];
            const caTLSCACerts2 = caInfo2.tlsCACerts.pem;
            const ca2 = new FabricCAServices(caInfo2.url, {trustedRoots: caTLSCACerts2, verify: false}, caInfo2.caName);//for second CA

            const walletPath2 = path.join(process.cwd(), 'wallet2', mspId2);
            const wallet_admin2 = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_admins");

            //display in the console the walletpath for org2
            console.log(`Wallet path: ${walletPath2}`);

            //Check to see if we've already enrolled the admin user for org2
            const identity2 = await wallet_admin2.get(adminid);
            if (identity2) {
                console.log(`An identiry for the admin user org2 '${admin_username}' already exists in the wallet`)
            }

            //Enroll the admin user for org2, and import the new identity into the wallet.
            const enrollment2 =  await ca2.enroll({enrollmentID: adminid, enrollmentSecret: adminpw});
            const x509Identity2 = {
                credentials: {
                    certificate: enrollment2.certificate,
                    privateKey: enrollment2.key.toBytes(),
                },
                mspId: mspId2,
                type: 'X.509',
            };

            await wallet_admin2.put(adminid, x509Identity2);

            await insertToAdminDB(id, firstName,lastName,email,admin_username,password,dept,uploader,admin,req.body.org);
            console.log(`Successfully enrolled admin user '${admin_username}'and imported it into the wallet`);
            res.render('success-reg');
            console.log(admin);
        } catch (error) {
            console.error(`Failed to enroll admin user ${admin_username}: ${error}`);
            process.exit(1);
            res.render('failure-reg');

        }

    }

    //FUNCTIONS FOR REGISTER USER
    //org1 registration of user
    async function register() {
        try {
            console.log("user enrollment for org1")
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet', mspId);
            // const wallet_admin = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet");
            // const wallet_users = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet_users");
            // const wallet_approvers = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet_approvers");
            const wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_admins");
            const wallet_users = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_users");
            const wallet_approvers = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_approvers");
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
                mspId: mspId,
                type: 'X.509',
            };
            if(approver==='on'){
                await insertToApproverDB(id, firstName, lastName, email, username, password, dept, approver)
                await wallet_approvers.put(username, x509Identity);
                console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);
            }else {
                await insertToUserDB(id, firstName, lastName, email, username, password, dept, uploader, req.body.org); //todo this is add to user
                await wallet_users.put(username, x509Identity);
                console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);
            }
            res.render('success-reg');
        }catch (error) {
            console.error(`Failed to register user ${username}: ${error}`);
            process.exit(1);
            res.render('failure-reg');
        }
    }


    //org2 registration of user
    async function register2(){
        try{
            console.log("user enrollment for org2");

            const walletPath2 = path.join(process.cwd(), 'wallet2', mspId2);

            //for org2 wallets
            const wallet_admin2 = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_admins");
            const wallet_users2 = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_users");
            const wallet_approvers2 = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_approvers");
            console.log(`Wallet path: ${walletPath2}`);

            //for second CA
            const caInfo2 = ccp.certificateAuthorities[caURL2];
            const caTLSCACerts2 = caInfo2.tlsCACerts.pem;

            const ca2 = new FabricCAServices(caInfo2.url, {trustedRoots: caTLSCACerts2, verify: false}, caInfo2.caName);

            const userIdentity2 = await wallet_users2.get(username);
            if (userIdentity2) {
                console.log(`An identity for the user ${username} already exists in the wallet`);
                return;
            }

            // Check to see if we've already enrolled the admin user.
            const adminIdentity2 = await wallet_admin2.get(adminid);
            if (!adminIdentity2) {
                console.log(`An identity for the admin user ${adminid} does not exist in the wallet`);
                console.log('Run the enrollAdmin.js application before retrying');
                return;
            }

            // build a user object for authenticating with the CA
            const provider = wallet_admin2.getProviderRegistry().getProvider(adminIdentity2.type);
            const adminUser2 = await provider.getUserContext(adminIdentity2, admin_username);

            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca2.register({
                // affiliation: 'org1.'+dept,
                enrollmentID: username,
                role: 'client'
            }, adminUser2);
            const enrollment2 = await ca2.enroll({
                enrollmentID: username,
                enrollmentSecret: secret
            });
            const x509Identity2 = {
                credentials: {
                    certificate: enrollment2.certificate,
                    privateKey: enrollment2.key.toBytes(),
                },
                mspId: mspId2,
                type: 'X.509',
            };

            if(approver==='on'){
                await insertToApproverDB(id, firstName, lastName, email, username, password, dept, approver)
                await wallet_approvers2.put(username, x509Identity2);
                console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);
            }else {
                await insertToUserDB(id, firstName, lastName, email, username, password, dept, uploader, req.body.org); //todo this is add to user
                await wallet_users2.put(username, x509Identity2);
                console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);
            }
            res.render('success-reg');
        }catch (error) {
            console.error(`Failed to register user ${username}: ${error}`);
            process.exit(1);
            res.render('failure-reg');
        }

    }



    //================================================ ENROLLMENT AS ADMIN AND REGISTER USERS ================================================
    if(admin==='on' && orgs === 'org1') {
        //calls enroll function for org1
        await enroll();
    }else if(admin === 'on' && orgs === 'org2') {
        //calls enroll function for org2
        await enroll2();
    }else if(admin !== 'on' && orgs === 'org1') {
        //calls register function for org1
        await register();
    }else if(admin !== 'on' && orgs === 'org2') {
        //calls register function for org2
        await register2()
    }

});



//============================================= GENERAL DB INSERTION =============================================
async function insertToUserDB(id, firstName, lastName, email, username, password, dept, uploader, org){
    const userOrg1DB = nano.db.use('org1-users');
    const userOrg2DB = nano.db.use('org2-users');
    if (org === 'org1'){
        userOrg1DB.insert({
            _id: id,
            firstname: firstName,
            lastname: lastName,
            email: email,
            username: username,
            password: SHA1(password).toString(enc.Hex),
            department: dept,
            add_doc: uploader || "off",
        })
    }else if (org === 'org2'){
        userOrg2DB.insert({
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
    return;
}

async function insertToApproverDB(id, firstName, lastName, email, username, password, dept, approver){
    const approverOrg1DB = nano.db.use('org1-approvers');
    const approverOrg2DB = nano.db.use('org2-approvers');
    if (org === 'org1'){
        await approverOrg1DB.insert({
            _id: id,
            firstname: firstName,
            lastname: lastName,
            email: email,
            username: username,
            password: SHA1(password).toString(enc.Hex),
            department: dept,
            def_approver:approver|| "off"
        })
    }else if (org === 'org2'){
        await approverOrg2DB.insert({
            _id: id,
            firstname: firstName,
            lastname: lastName,
            email: email,
            username: username,
            password: SHA1(password).toString(enc.Hex),
            department: dept,
            def_approver:approver|| "off"
        })
    }
    return;
}

async function insertToAdminDB (id, firstName, lastName, email, admin_username, password, dept, uploader, admin,org){
    const adminOrg1DB = nano.db.use('org1-admins');
    const adminOrg2DB = nano.db.use('org2-admins');
    if (org==='org1'){
        await adminOrg1DB.insert({
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
    }else if (org==='org2'){
        await adminOrg2DB.insert({
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
    }
}

//============================================= WALLET INSERTION =============================================

module.exports = router