const express = require('express');
const { Contract } = require('fabric-contract-api');
const bodyParser = require('body-parser');
const { generateFromEmail } = require("unique-username-generator");
const generator = require('generate-password');
const app = express();
const session = require('express-session')
//todo comment out later:
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
//const nano = require('nano')('http://admin:mysecretpassword@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');


// session var init
app.use(session({
    secret: 'secretkeytest',
    saveUninitialized: false,
    cookie: {maxAge: 3600000},
    resave: false
}))

// function to access sessions on all views
app.use(function(req, res, next){
    // res.locals = req.session;
    res.locals.admin = req.session.admin
    next();
})

//the rest
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

app.set('view engine', 'ejs');


//todo commented out db
const dbList = nano.db.list();
// show list of databases
dbList.then(function (dbs){
    console.log(dbs)
})
// databases
const userDB = nano.db.use('users');
const userViews = "/_design/all_users/_view/all";
//end comment out

//function for checking sign-in
function isAuthenticated (req, res, next){
    if(req.session.user){
        next();
        console.log('There is a session') //will delete, to check lang to
    }
    else{
        console.log("NO SESSION");
        let checkSession = false;
        res.render('no-access', {checkSession: checkSession});
    }
}
//checking if admin. will change it soon tho
function isAdmin (req, res, next){
    if(req.session.admin === true){
        next();
        console.log('This is an admin') //will delete, to check lang to
    }
    else{
        console.log("not an admin or a session");
        res.render('no-access') //will change to unauthorized access page soon lolxz
    }
}

app.get('/create-docs', function (req, res){
    res.render("create-docs");
})

app.get('/header', function (req, res){
    res.render("header");
})

app.get('/', function (req, res){
    res.render("index");
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
//Mount all routers
app.use('/login', loginRouter)
app.use('/logout', logoutRouter)
// added isAuthenticated function so that only authenticated sessions are able to access these pages
app.use('/dashboard', isAuthenticated, dashboardRouter)
app.use('/documents', isAuthenticated, documentsRouter)
app.use('/all-documents', isAuthenticated, allDocumentsRouter)
app.use('/administration', isAuthenticated, isAdmin, adminRouter);
app.use('/view-documents', isAuthenticated, viewDocumentsRouter)
app.use('/registration',isAuthenticated,isAdmin,regRouter)




//FOR DEVELOPMENT WITH NO AUTHENTICATION DO NOT REMOVE
// app.use('/dashboard', dashboardRouter)
// app.use('/documents', documentsRouter)
// app.use('/all-documents', allDocumentsRouter)
// app.use('/administration', isAdmin, adminRouter);
// app.use('/view-documents', viewDocumentsRouter)

