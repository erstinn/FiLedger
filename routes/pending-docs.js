const express = require('express')
const router = express.Router()
const fs = require("fs") //remove?
const path = require('path')

// databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');
const userDB = nano.db.use('users');
const docViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"]

router.get('/', async function (req,res){
    const documents = await  docsDB.find({selector:{
            _id:{
                "$gt":null
            }
        }})
            // "_id": req.params.id,
            // "status": req.params.status
    console.log(documents)
    res.render("pending-docs",{d : documents, username : req.session.username});
})

module.exports = router