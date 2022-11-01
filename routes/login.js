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
    const passw = SHA1(req.body.password).toString(enc.Hex);
    const dept = req.body.dept;
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
    const wallet_admin = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "wallet");
    const wallet_user = await Wallets.newCouchDBWallet('http://administrator:qF3ChYhp@127.0.0.1:5984/', "wallet_users");
    console.log(`Wallet path: ${walletPath}`); //dno if irrelevant if couchdb code
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
            "department": dept
        }
    };
    const responseUserDB = await userDB.find(q)
    const responseAdminDB = await adminDB.find(q)
    //need double equal lang para gumana (di maka-access pag wrong pass)
    if(responseUserDB.docs == '' && responseAdminDB.docs == '' || dept === undefined ){
        logErr = 'Incorrect Login Credentials. Please try again...';
        res.render('login', {dep:departments, logErr:logErr})//placeholder
    }else{
        const q1 = {
            selector: {
                "email": varemail,
                "password": passw,
                "department": dept,
            }
        };

        const adminRes = await adminDB.find(q1)
        const userRes = await userDB.find(q1)
        console.log("hello")
        if(adminRes.bookmark !== 'nil'){
            const adminIdentity = await wallet_admin.get("enroll");
            if (adminIdentity) {
                console.log(`An identity for the user ${adminRes.docs[0].username} already exists in the wallet`);
                req.session.admin = true;
                console.log('ADMIN LOGGED IN');
                req.session.username = adminRes.docs[0].username;
                req.session.user = varemail;
                res.redirect('/dashboard');
            }else{
                logErr = 'Incorrect Login Credentials. Please try again...';
                res.render('login', {dep:departments, logErr:logErr})//placeholder
            }
        }
        req.session.user = varemail;
        req.session.username = userRes.docs[0].username;
        // console.log(userRes.docs[0])
        const userIdentity = await wallet_user.get(req.session.username);
        if (userIdentity) {
            // console.log(`An identity for the user ${userRes.docs[0].username} already exists in the wallet`); //todo remove
            console.log('USER LOGGED IN');
            req.session.username = userRes.docs[0].username;
            req.session.user = varemail;
            res.redirect('/dashboard');
        }else{
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