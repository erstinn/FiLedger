const express = require('express')
const router = express.Router()
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');


router.get('/admin',async function (req,res){
    // if (req.session.org === 'r')
    const docsDB = req.session.currentDocsDB;
    const docs = await docsDB.find({
        selector:{
            "_id":{
                "$gt":null
            }
        }
    })

    res.render("admin",{username : req.session.username,docs:docs});
})

module.exports = router