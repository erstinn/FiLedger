const express = require('express')
const router = express.Router()
const session = require('express-session')
const SHA1  = require('crypto-js/sha1');
const { enc } = require('crypto-js');
const path = require("path");
const {Wallets} = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const yaml = require("js-yaml");
const fs = require("fs");
// databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented

// session var
router.use(session({
    secret: 'secretkeytest',
    saveUninitialized: false,
    cookie: {maxAge: 3600000}, //one hour maxAge, not sure abt this one
    resave: false
}))

router.get('/', function (req, res){
    res.render("login", {dep: departments});
})

//Gets the data obtained from Login Form
router.post('/',queryDB, getAdminIdentity, getApproverIdentity, getUserIdentity, async function (req, res) {
    console.log(req.body.email)
    console.log(req.body.dept)
    const passw = SHA1(req.body.password).toString(enc.Hex);
    const dept = req.body.dept;
    const org = req.body.org;
    let logErr = '';
    // load the network configuration
    let mspId = "Org1MSP";
    const caURL = "org1-ca.fabric";
    const caURL2 = "org2-ca.fabric";
    const ccpPath = path.resolve("./network/try-k8/", "connection-org.yaml");
    if (ccpPath.includes(".yaml")) {
        ccp = yaml.load(fs.readFileSync(ccpPath, 'utf-8'));
    } else {
        ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    }
    const caInfo = ccp.certificateAuthorities[caURL];
    //for second CA
    const caInfo2 = ccp.certificateAuthorities[caURL2];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    //for second CA
    const caTLSCACerts2 = caInfo2.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);
    //for second CA
    const ca2 = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo2.caName);
    const walletPath = path.join(process.cwd(), 'wallet', mspId);
    // const wallet_admin = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet");
    // const wallet_user = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet_users");
    // const wallet_approver = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet_approvers");
    //todo network/wallet connection end

    const indexDef = {
        index: { fields: ["email", "password", "department"]},
        type: "json",
        name: "trial-index"
    }


    console.log('fking admin:');
    console.log(req.session.admin);
    console.log('fking approver:');
    console.log(req.session.approver);
    console.log('fking user:');
    console.log(req.session.user);
        //TODO if it is an admin:
            if (req.session.admin === true && req.session.organization !== "undefined") {
                res.redirect('/dashboard');
            }
        //TODO check if approver:
            if (req.session.approver === true && req.session.org !== "undefined") {
                res.redirect('/dashboard');
            }
        //TODO else if it is a user
            else if (req.session.user === true && req.session.org !== "undefined") {
                res.redirect('/dashboard');
            }else{ //ELSE IF NOT ENROLLED or in db
        logErr = 'Incorrect Login Credentials. Please try again...';
        res.render('login', {dep:departments, logErr:logErr})
        }

})

router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/')
})

function loginError(responseUserDB, responseAdminDB){
    logErr = 'Incorrect Login Credentials. Please try again...';
    res.render('login', {dep:departments, logErr:logErr})//placeholder
}

async function queryDB(req,res,next){
    return q = {
        selector: {
            "email": req.body.email,
            "password": req.body.password,
            "department": req.body.department,
            "organization":req.body.org
        }
    };
    next();
}


//======================================== MIDDLEWARES ========================================
async function getAdminIdentity(req, res, next) {
    const adminOrg1DB = nano.db.use('org1-admins');
    const adminOrg2DB = nano.db.use('org2-admins');
    const responseOrg1AdminDB = await adminOrg1DB.find(queryDB())
    const responseOrg2AdminDB = await adminOrg2DB.find(queryDB())
    const org1Wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_admins");
    const org2Wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_admins");
    const adminIdentityOrg1 = await org1Wallet_admin.get("enroll");
    const adminIdentityOrg2 = await org2Wallet_admin.get("enroll");
    if (adminIdentityOrg1) {
        req.session.admin = true;
        console.log('Org1 ADMIN LOGGED IN');
        req.session.username = responseOrg1AdminDB.docs[0].username;
        req.session.email = req.body.email; //todo  bakit naging .user? mas klaro email; TODO palitan req.session.user if username ung gamit
        req.session.firstname = responseOrg1AdminDB.docs[0].firstname;
        req.session.lastname = responseOrg1AdminDB.docs[0].lastname;
        next();
    } else if (adminIdentityOrg2) {
        req.session.admin = true;
        console.log('Org2 ADMIN LOGGED IN');
        req.session.username = responseOrg2AdminDB.docs[0].username;
        req.session.email = req.body.email;
        req.session.firstname = responseOrg2AdminDB.docs[0].firstname;
        req.session.lastname = responseOrg2AdminDB.docs[0].lastname;
        next();
    }
    next();
}

async function getApproverIdentity(req,res,next){
    const approverOrg1DB = nano.db.use('org1-approvers');
    const approverOrg2DB = nano.db.use('org2-approvers');
    const responseOrg1ApproverDB = await approverOrg1DB.find(queryDB())
    const responseOrg2ApproverDB = await approverOrg2DB.find(queryDB())
    const org1Wallet_approver = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_approver");
    const org2Wallet_approver = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_approver");
    const approverIdentityOrg1 = await org1Wallet_approver.get(req.session.username);
    const approverIdentityOrg2 = await org2Wallet_approver.get(req.session.username);

    if(approverIdentityOrg1){
        console.log('USER LOGGED IN');
        req.session.username = responseOrg1ApproverDB.docs[0].username;
        req.session.department = responseOrg1ApproverDB.docs[0].department;
        req.session.firstname = responseOrg1ApproverDB.docs[0].firstname;
        req.session.lastname = responseOrg1ApproverDB.docs[0].lastname;
        req.session.org = "org1"; //TODO pakinote nalang nito, dito nasset org
        req.session.approver = true;
        next();
    }else if (approverIdentityOrg2){
        console.log('USER LOGGED IN');
        req.session.username = responseOrg2ApproverDB.docs[0].username;
        req.session.department = responseOrg2ApproverDB.docs[0].department;
        req.session.firstname = responseOrg2ApproverDB.docs[0].firstname;
        req.session.lastname = responseOrg2ApproverDB.docs[0].lastname;
        req.session.org = "org2"; //TODO pakinote nalang nito, dito nasset org
        req.session.approver = true;
        next();
    }
    next();
}

async function getUserIdentity(req,res,next){
    const userOrg1DB = nano.db.use('org1-users');
    const userOrg2DB = nano.db.use('org2-users');
    const responseOrg1UserDB = await userOrg1DB.find(queryDB());
    const responseOrg2UserDB = await userOrg2DB.find(queryDB());
    const org1Wallet_user = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_users");
    const org2Wallet_user = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_users");
    const userIdentityOrg1 = await org1Wallet_user.get(req.session.username);
    const userIdentityOrg2 = await org2Wallet_user.get(req.session.username);

    if(userIdentityOrg1){
        console.log('USER LOGGED IN');
        req.session.username = responseOrg1UserDB.docs[0].username;
        req.session.department = responseOrg1UserDB.docs[0].department;
        req.session.firstname = responseOrg1UserDB.docs[0].firstname;
        req.session.lastname = responseOrg1UserDB.docs[0].lastname;
        req.session.org = "org1"; //TODO pakinote nalang nito, dito nasset org
        req.session.user = true;
        next();
    }else if (userIdentityOrg2){
        console.log('USER LOGGED IN');
        req.session.username = responseOrg2UserDB.docs[0].username;
        req.session.department = responseOrg2UserDB.docs[0].department;
        req.session.firstname = responseOrg2UserDB.docs[0].firstname;
        req.session.lastname = responseOrg2UserDB.docs[0].lastname;
        req.session.org = "org2"; //TODO pakinote nalang nito, dito nasset org
        req.session.user = true;
        next();
    }
    next();
}


module.exports = router