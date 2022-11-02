const express = require('express')
const router = express.Router()
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
//const nano = require('nano')('http://admin:mysecretpassword@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');



router.get('/',async(req,res)=>{
    const documents = await docsDB.find({selector:{
        _id:{
            "$gt":null
        }
    }})
    console.log(documents)
    res.render("all-documents",{docs:documents,username : req.session.username})
})


module.exports = router