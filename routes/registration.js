const express = require('express')
const {generateFromEmail} = require("unique-username-generator");
const generator = require("generate-password");
const SHA1  = require('crypto-js/sha1');
const { enc } = require('crypto-js');
const router = express.Router()
//databases
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const userDB = nano.db.use('users');
const userViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented

router.get('/', function (req, res){
    res.render("registration", {dep: departments});
})

router.post("/status", async function (req, res){
    const userName = req.body.username; //generated
    const lastName = req.body.lastname;
    const firstName = req.body.firstname;
    const email = req.body.email;
    const password = req.body.password; //generated
    const admin = req.body.isAdmin;
    const add_doc = req.body.add_doc;
    const dept = req.body.dept; //this works now

    //generate id
    let uuid = await nano.uuids(1);
    let id = uuid.uuids[0];

    //generate username
    const username = generateFromEmail(
        email,
        3
    );

    //generate default password
    const passw = SHA1 (generator.generate({
        length: 10,
        numbers: true
    })).toString(enc.Hex)

    await userDB.insert({
        _id: id,
        firstname: firstName,
        lastname: lastName,
        email: email,
        username: username,
        password: passw,
        department: dept,
        add_doc: add_doc,
        admin: admin
    })

    if(res.statusCode === 200){
        res.render('success-reg');
    }
    else{
        //not sure if need
        res.render('failure-reg');
    }

    // console.log(dept, lname, fname, email, password, un, admin, add_doc);

})

module.exports = router