const express = require('express')
const router = express.Router()
const session = require('express-session')
// databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
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
    const passw = req.body.password;
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

    //need double equal lang para gumana
    console.log(response)
    if(response.docs === '' || dept === undefined){
        logErr = 'Incorrect Login Credentials. Please try again...';
        //sends login error to login.ejs
        res.render('login', {dep:departments, logErr:logErr})//placeholder
    }else{
        req.session.user = varemail;
        console.log(req.session.user);
        res.redirect('/dashboard')
    }

    console.log(index);
})

router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/')
}) //DITO MUNA FOR NOW, WILL BE MOVING TO SEPARATE FILE SOON

module.exports = router