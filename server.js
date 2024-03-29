const express = require('express');
const { Contract } = require('fabric-contract-api');
const bodyParser = require('body-parser');
const { generateFromEmail } = require("unique-username-generator");
const generator = require('generate-password');
const app = express();
const session = require('express-session')
const invoke = require('./network/chaincode/javascript/invoke')
const nano = require('nano')('http://localhost:5984/_utils/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');

// session var init
app.use(session({
    secret: 'secretkeytest',
    saveUninitialized: false,
    cookie: {maxAge: 3600000},
    resave: false
}))

// function to access sessions on all views
app.use(function(req, res, next){
    res.locals.admin = req.session.admin;
    next();
})

app.use(function(req, res, next){
    res.locals.user = req.session.user;
    next();
})
app.use(function(req, res, next){
    res.locals.approver = req.session.approver;
    next();
})

app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

app.set('view engine', 'ejs');


const dbList = nano.db.list();
dbList.then(function (dbs){
    console.log(dbs)
})

function isAuthenticated (req, res, next){
    if(req.session.user || req.session.admin || req.session.approver){
        next();
        console.log('There is a session')
    }
    else{
        console.log("NO SESSION");
        let checkSession = false;
        res.render('no-access', {checkSession: checkSession});
    }
}

function isLoggedIn (req, res, next){
    if(!req.session.username){
        next();
        console.log('BITCH IS NOT LOGGED IN')
    }
    else{
        console.log("with session");
        res.redirect('/dashboard');
    }
}

//checking if admin. will change it soon tho
function isAdmin (req, res, next){
    if(req.session.admin === true){
        next();
        console.log('This is an admin')
    }
    else{
        console.log("not an admin or a session");
        res.render('no-access')
    }
}

function isUser (req, res, next){
    if(req.session.user === true){
        next();
        console.log('user login')
    }
    else{
        console.log("not user or a session");
        res.render('no-access')
    }
}

function isApprover (req, res, next){
    if(req.session.approver === true){
        next();
        console.log('approver login')
    }
    else{
        console.log("not an approver or a session");
        res.render('no-access')
    }
}

//todo DOCUMENTS db
function setSessionDocsDB(req, res, next){ //bobo ko bat di ko ginawa una palang 🤡
    if (req.session.org==='org1'){
        req.session.currentDocsDB = nano.db.use('org1-documents');
    }else{
        req.session.currentDocsDB = nano.db.use('org2-documents');
    }
    next();
}

//todo ALL USERS db
function setSessionUsersDB(req, res, next){ //bobo ko bat di ko ginawa una palang 🤡
    if (req.session.org==='org1'){
        req.session.currentUsersDB = nano.db.use('org1-users');
        req.session.currentUsersWalletDB = nano.db.use('org1-wallet_users');

        req.session.currentAdminsDB = nano.db.use('org1-admins');
        req.session.currentAdminsWalletDB = nano.db.use('org1-wallet_admins');

        req.session.currentApproversDB = nano.db.use('org1-approvers');
        req.session.currentApproversWalletDB = nano.db.use('org1-wallet_approvers');
    }else{
        req.session.currentUsersDB = nano.db.use('org2-users');
        req.session.currentUsersWalletDB = nano.db.use('org1-wallet_users');

        req.session.currentAdminsDB = nano.db.use('org2-admins');
        req.session.currentAdminsWalletDB = nano.db.use('org2-wallet_admins');

        req.session.currentApproversDB = nano.db.use('org2-approvers');
        req.session.currentApproversWalletDB = nano.db.use('org2-wallet_approvers');
    }
    next();
}



app.get('/create-docs', function (req, res){
    res.render("create-docs");
})

app.get('/header', function (req, res){
    res.render("header");
})

app.get('/', function (req, res, next){
    if(!req.session.user || !req.session.admin){
        res.render("index");
    }
    else{
        res.redirect('/dashboard');
    }
})



app.listen(process.env.PORT || 3000, function (){
    console.log("Server started on port 3000")
})

// Init all routers
const loginRouter = require("./routes/login")
const logoutRouter = require("./routes/logout")
const regRouter = require("./routes/registration")
const dashboardRouter = require("./routes/dashboard")
// const dashboardRouter = require("./network/chaincode/fabcar/javascript/lib/createDoc");
const documentsRouter = require("./routes/documents")
const allDocumentsRouter = require("./routes/all-documents")
const adminRouter = require("./routes/administration")
const viewDocumentsRouter = require("./routes/view-documents")
const api = require('./routes/api')
// const pendingDocs = require('./routes/pending-docs')

//Mount all routers
app.use('/login', isLoggedIn , loginRouter);
app.use('/logout', logoutRouter);
app.use('/api', setSessionDocsDB, setSessionUsersDB, api);
app.use('/dashboard', isAuthenticated,setSessionDocsDB,setSessionUsersDB, dashboardRouter);
app.use('/documents', isAuthenticated, isApprover, isUser,setSessionDocsDB,setSessionUsersDB, documentsRouter); //TODO CONSIDERING REMOVAL
app.use('/all-documents', isAuthenticated,setSessionDocsDB,setSessionUsersDB, allDocumentsRouter);
app.use('/administration', isAuthenticated, isAdmin,setSessionDocsDB,setSessionUsersDB, adminRouter);
app.use('/view-documents', isAuthenticated, isAdmin,setSessionDocsDB, setSessionUsersDB, viewDocumentsRouter) //TODO CONSIDERING REMOVAL
app.use('/registration',isAuthenticated,isAdmin,setSessionDocsDB,setSessionUsersDB, regRouter);
// app.use('/pending-docs', isAuthenticated, pendingDocs)
// app.use('/pending-docs', isAuthenticated, myFunc);

//FOR DEVELOPMENT WITH NO AUTHENTICATION DO NOT REMOVE
// app.use('/dashboard', dashboardRouter)
// app.use('/documents', documentsRouter)
// app.use('/all-documents', allDocumentsRouter)
// app.use('/administration', adminRouter);
// app.use('/view-documents', viewDocumentsRouter)
// app.use('/registration', regRouter);

