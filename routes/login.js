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
const serverip = '127.0.0.1'
const nano = require('nano')(`http://admin:admin@${serverip}:5984/`);
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
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
    if(!req.session.user || !req.session.admin){
        res.render("login", {dep: departments});
    }else{
        res.redirect("/dashboard")
    }
    
})

//Gets the data obtained from Login Form
router.post('/', getAdminIdentity, getApproverIdentity, getUserIdentity, async function (req, res) {
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
    if (req.session.user !== true && req.session.approver !== true && req.session.admin !== true) {
        logErr = 'Incorrect Login Credentials. Please try again...';
        res.render('login', {dep: departments, logErr: logErr})
    }
})

router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/')
})

//======================================== MIDDLEWARES ========================================
async function getAdminIdentity(req, res, next) {
    let q = {
        selector: {
            "email": req.body.email,
            "password": SHA1(req.body.password).toString(enc.Hex),
            "department": req.body.dept
        }
    };
    const adminOrg1DB = nano.db.use('org1-admins');
    const adminOrg2DB = nano.db.use('org2-admins');
    const responseOrg1AdminDB = await adminOrg1DB.find(q)
    const responseOrg2AdminDB = await adminOrg2DB.find(q)
    const org1Wallet_admin = await Wallets.newCouchDBWallet('http://admin:admin@127.0.0.1:5984/', "org1-wallet_admins");
    const org2Wallet_admin = await Wallets.newCouchDBWallet('http://admin:admin@127.0.0.1:5984/', "org2-wallet_admins");
    const adminIdentityOrg1 = await org1Wallet_admin.get("enroll");
    const adminIdentityOrg2 = await org2Wallet_admin.get("enroll");

    console.log(responseOrg1AdminDB.bookmark, "org1admin")
    console.log(responseOrg2AdminDB.bookmark, "org2admin")
    console.log(SHA1(req.body.password).toString(enc.Hex), "current pw")


    if (adminIdentityOrg1 && responseOrg1AdminDB.bookmark !== 'nil' ) {
        req.session.admin = true;
        console.log('Org1 ADMIN LOGGED IN');
        req.session.username = responseOrg1AdminDB.docs[0].username;
        req.session.department = responseOrg1AdminDB.docs[0].department;
        req.session.email = req.body.email; //TODO palitan req.session.user if username ung gamit
        req.session.firstname = responseOrg1AdminDB.docs[0].firstname;
        req.session.lastname = responseOrg1AdminDB.docs[0].lastname;
        req.session.org = "org1"; //TODO pakinote nalang nito, dito nasset org
        res.redirect('/dashboard');
    } else if (adminIdentityOrg2 && responseOrg2AdminDB.bookmark !== 'nil') {
        req.session.admin = true;
        console.log('Org2 ADMIN LOGGED IN');
        req.session.username = responseOrg2AdminDB.docs[0].username;
        req.session.department = responseOrg2AdminDB.docs[0].department;
        req.session.email = req.body.email;
        req.session.firstname = responseOrg2AdminDB.docs[0].firstname;
        req.session.lastname = responseOrg2AdminDB.docs[0].lastname;
        req.session.org = "org2"; //TODO pakinote nalang nito, dito nasset org
        res.redirect('/dashboard');
    }
    next();
}

async function getApproverIdentity(req,res,next){
    let q = {
        selector: {
            "email": req.body.email,
            "password": SHA1(req.body.password).toString(enc.Hex),
            "department": req.body.dept
        }
    };
    const approverOrg1DB = nano.db.use('org1-approvers');
    const approverOrg2DB = nano.db.use('org2-approvers');
    const responseOrg1ApproverDB = await approverOrg1DB.find(q)
    const responseOrg2ApproverDB = await approverOrg2DB.find(q)
    const org1Wallet_approver = await Wallets.newCouchDBWallet('http://admin:admin@127.0.0.1:5984/', "org1-wallet_approvers");
    const org2Wallet_approver = await Wallets.newCouchDBWallet('http://admin:admin@127.0.0.1:5984/', "org2-wallet_approvers");
    console.log(responseOrg1ApproverDB.bookmark, "org1approver")
    console.log(responseOrg2ApproverDB.bookmark, "org2approver")
    console.log(SHA1(req.body.password).toString(enc.Hex), "current pw")

    if (responseOrg1ApproverDB.bookmark !== 'nil') {
        const approverIdentityOrg1 = await org1Wallet_approver.get(responseOrg1ApproverDB.docs[0].username);
        if (approverIdentityOrg1) {
            console.log('USER LOGGED IN');
            req.session.username = responseOrg1ApproverDB.docs[0].username;
            req.session.department = responseOrg1ApproverDB.docs[0].department;
            req.session.firstname = responseOrg1ApproverDB.docs[0].firstname;
            req.session.lastname = responseOrg1ApproverDB.docs[0].lastname;
            req.session.org = "org1"; //TODO pakinote nalang nito, dito nasset org
            req.session.approver = true;
            res.redirect('/dashboard');
        }else{
            req.session.approver = false
        }
    } else if (responseOrg2ApproverDB.bookmark !== 'nil') {
        const approverIdentityOrg2 = await org2Wallet_approver.get(responseOrg2ApproverDB.docs[0].username);
        if (approverIdentityOrg2) {
            console.log('USER LOGGED IN');
            req.session.username = responseOrg2ApproverDB.docs[0].username;
            req.session.department = responseOrg2ApproverDB.docs[0].department;
            req.session.firstname = responseOrg2ApproverDB.docs[0].firstname;
            req.session.lastname = responseOrg2ApproverDB.docs[0].lastname;
            req.session.org = "org2"; //TODO pakinote nalang nito, dito nasset org
            req.session.approver = true;
            res.redirect('/dashboard');
        }else{
            req.session.approver = false

        }
    }
    next();
}

async function getUserIdentity(req,res,next) {
    let q = {
        selector: {
            "email": req.body.email,
            "password": SHA1(req.body.password).toString(enc.Hex),
            "department": req.body.dept
        }
    };
    const userOrg1DB = nano.db.use('org1-users');
    const userOrg2DB = nano.db.use('org2-users');
    const responseOrg1UserDB = await userOrg1DB.find(q);
    const responseOrg2UserDB = await userOrg2DB.find(q);
    const org1Wallet_user = await Wallets.newCouchDBWallet('http://admin:admin@127.0.0.1:5984/', "org1-wallet_users");
    const org2Wallet_user = await Wallets.newCouchDBWallet('http://admin:admin@127.0.0.1:5984/', "org2-wallet_users");

    console.log(responseOrg1UserDB.bookmark, "org1user")
    console.log(responseOrg2UserDB.bookmark, "org2user",)
    // console.log(SHA1(req.body.password).toString(enc.Hex), "current pw")

    if (responseOrg1UserDB.bookmark !== 'nil') {
        const userIdentityOrg1 = await org1Wallet_user.get(responseOrg1UserDB.docs[0].username);
        if (userIdentityOrg1) {
            console.log('USER LOGGED IN');
            req.session.username = responseOrg1UserDB.docs[0].username;
            req.session.department = responseOrg1UserDB.docs[0].department;
            req.session.firstname = responseOrg1UserDB.docs[0].firstname;
            req.session.lastname = responseOrg1UserDB.docs[0].lastname;
            req.session.org = "org1"; //TODO pakinote nalang nito, dito nasset org
            req.session.user = true;
            res.redirect('/dashboard');
        }
    } else if (responseOrg2UserDB.bookmark !== 'nil') {
        const userIdentityOrg2 = await org2Wallet_user.get(responseOrg2UserDB.docs[0].username)
        if (userIdentityOrg2) {
            console.log('USER LOGGED IN');
            req.session.username = responseOrg2UserDB.docs[0].username;
            req.session.department = responseOrg2UserDB.docs[0].department;
            req.session.firstname = responseOrg2UserDB.docs[0].firstname;
            req.session.lastname = responseOrg2UserDB.docs[0].lastname;
            req.session.org = "org2"; //TODO pakinote nalang nito, dito nasset org
            req.session.user = true;
            res.redirect('/dashboard');
        }
    }
    next();
}

module.exports = router