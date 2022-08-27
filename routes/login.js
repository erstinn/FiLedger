const express = require('express')
const router = express.Router()




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
    if(response.docs == '' || dept === undefined){
        logErr = 'Incorrect Login Credentials. Please try again...';
        //sends login error to login.ejs
        res.render('login', {dep:departments, logErr:logErr})//placeholder
    }else{
        res.redirect('/dashboard')
    }

    console.log(index);
})


module.exports = router