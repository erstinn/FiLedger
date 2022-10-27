const express = require('express')
const router = express.Router()
const session = require('express-session')
const SHA1  = require('crypto-js/sha1');
const { enc } = require('crypto-js');
// databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
//const nano = require('nano')('http://admin:mysecretpassword@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const userDB = nano.db.use('users');
// const userViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented

// session var
router.use(session({
    secret: 'secretkeytest',
    saveUninitialized: false,
    cookie: {maxAge: 3600000}, //one hour maxAge, not sure abt this one
    resave: false
}))

//the rest
router.get('/', function (req, res){
    res.render("login", {dep: departments});
})

//Gets the data obtained from Login Form
router.post('/', async function (req, res) {
    const varemail = req.body.email;
    const passw = SHA1(req.body.password).toString(enc.Hex);
    const dept = req.body.dept;
    let logErr = '';

    //created an index since mas advisable ata pag nag-qquery and nawawala yung warning :>
    // not sure if index is used by ill keep it here nalang muna -dana
    const indexDef = {
        index: { fields: ["email", "password", "department"]},
        type: "json",
        name: "trial-index"
    }

    //needed lang para mawala warning but not sure di naman ata super need?
    const index = await userDB.createIndex(indexDef);

    const q = {
        selector: {
            "email": varemail,
            "password": passw,
            "department": dept
        }
    };

    const response = await userDB.find(q)

    // console.log(response)
    //need double equal lang para gumana (di maka-access pag wrong pass)
    if(response.docs == '' || dept === undefined){
        logErr = 'Incorrect Login Credentials. Please try again...';
        //sends login error to login.ejs
        res.render('login', {dep:departments, logErr:logErr})//placeholder
    }else{
        //this is SOOO inefficient, placeholder lng and will change it soon pag na resolve q na how 2-dana
        const q1 = {
            selector: {
                "email": varemail,
                "password": passw,
                "department": dept,
                "admin": "on"
            }
        };

        const adminRes = await userDB.find(q1)
        if(adminRes.bookmark !== 'nil'){
            req.session.admin = true;
            console.log('ADMIN LOGGED IN')
        }
        req.session.user = varemail;
        req.session.username = adminRes.docs[0].username;
        // console.log(adminRes); //for testing
        res.redirect('/dashboard')
    }

    // console.log(index);
})

router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/')
}) //DITO MUNA FOR NOW, WILL BE MOVING TO SEPARATE FILE SOON

module.exports = router