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
const userDB = nano.db.use('users');
const adminDB = nano.db.use('admins');
const approverDB = nano.db.use('approvers');
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
router.post('/', async function (req, res) {
    const varemail = req.body.email;
    console.log(req.body.email)
    console.log(req.body.dept)
    const passw = SHA1(req.body.password).toString(enc.Hex);
    const dept = req.body.dept;
    const org = req.body.org;
    let logErr = '';
    // load the network configuration
    let mspId = "Org1MSP";
    const caURL = "org1-ca.fabric";
    const ccpPath = path.resolve("./network/try-k8/", "connection-org.yaml");
    if (ccpPath.includes(".yaml")) {
        ccp = yaml.load(fs.readFileSync(ccpPath, 'utf-8'));
    } else {
        ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    }
    const caInfo = ccp.certificateAuthorities[caURL];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, {trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);
    const walletPath = path.join(process.cwd(), 'wallet', mspId);
    // const wallet_admin = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet");
    // const wallet_user = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet_users");
    // const wallet_approver = await Wallets.newCouchDBWallet('http://root:root@127.0.0.1:5984/', "wallet_approvers");
    const org1Wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_admins");
    const org2Wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_admins");
    const org1Wallet_user = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_users");
    const org2Wallet_user = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_users");
    const org1Wallet_approver = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org1-wallet_approvers");
    const org2Wallet_approver = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "org2-wallet_approvers");
    //todo network/wallet connection end

    const indexDef = {
        index: { fields: ["email", "password", "department"]},
        type: "json",
        name: "trial-index"
    }
    const q = {
        selector: {
            "email": varemail,
            "password": passw,
            "department": dept,
            "organization":org
        }
    };
    const responseOrg1UserDB = await userDB.find(q)
    const responseOrg2UserDB = await userDB.find(q)
    const responseOrg1AdminDB = await adminDB.find(q)
    const responseOrg2AdminDB = await adminDB.find(q)
    const responseOrg1ApproverDB = await approverDB.find(q)
    const responseOrg2ApproverDB = await approverDB.find(q)
        // console.log("hello")
        // if(responseAdminDB.bookmark === 'nil')
        //     console.log('admin not')
        // if(responseApproverDB.bookmark === 'nil')
        //     console.log('approver not')
        // if(responseUserDB.bookmark === 'nil')
        //     console.log('user not')
    //need double equal lang para gumana (di maka-access pag wrong pass)
    if(responseUserDB.docs == '' && responseAdminDB.docs == '' && responseApproverDB.docs == '' || dept === undefined ){
        logErr = 'Incorrect Login Credentials. Please try again...';
        res.render('login', {dep:departments, logErr:logErr})//placeholder
    }else{
            //if it is an admin:
        if(responseAdminDB.bookmark !== 'nil'){
            const adminIdentity = await wallet_admin.get("enroll");
            if (adminIdentity) {
                console.log(`An identity for the user ${responseAdminDB.docs[0].username} already exists in the wallet`);
                req.session.admin = true;
                console.log('ADMIN LOGGED IN');
                req.session.username = responseAdminDB.docs[0].username;
                req.session.user = varemail;
                req.session.firstname = responseAdminDB.docs[0].firstname;
                req.session.lastname = responseAdminDB.docs[0].lastname;
                res.redirect('/dashboard');
            }
        }
        //check if approver:
        else if(responseApproverDB.bookmark !== 'nil') {
            req.session.user = varemail;
            req.session.username = responseApproverDB.docs[0].username;
            const approverIdentity = await wallet_approver.get(req.session.username);
            if (approverIdentity) {
                console.log('APPROVER LOGGED IN');
                req.session.username = responseApproverDB.docs[0].username;
                req.session.department = responseApproverDB.docs[0].department;
                req.session.firstname = responseApproverDB.docs[0].firstname;
                req.session.lastname = responseApproverDB.docs[0].lastname;
                req.session.user = varemail;
                req.session.approver = true;
                res.redirect('/dashboard');
            } else {
                logErr = 'Incorrect Login Credentials. Please try again...';
                res.render('login', {dep: departments, logErr: logErr})//placeholder
            }
        }
        //else if it is a user
        else if(responseUserDB.bookmark !== 'nil') {
            req.session.user = varemail;
            req.session.username = responseUserDB.docs[0].username;
            const userIdentity = await wallet_user.get(req.session.username);
            if (userIdentity) {
                // console.log(`An identity for the user ${userRes.docs[0].username} already exists in the wallet`); //todo remove
                console.log('USER LOGGED IN');
                req.session.username = responseUserDB.docs[0].username;
                req.session.department = responseUserDB.docs[0].department;
                req.session.firstname = responseUserDB.docs[0].firstname;
                req.session.lastname = responseUserDB.docs[0].lastname;
                req.session.user = varemail;
                req.session.user = true;
                res.redirect('/dashboard');
            } else {
                logErr = 'Incorrect Login Credentials. Please try again...';
                res.render('login', {dep: departments, logErr: logErr})//placeholder
            }
        }else{ //ELSE IF NOT ENROLLED
        logErr = 'Incorrect Login Credentials. Please try again...';
        res.render('login', {dep:departments, logErr:logErr})//placeholder
        }
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
module.exports = router