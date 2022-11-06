const express = require('express')
const router = express.Router()
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');


router.get('/admin',async function (req,res){
    // if (req.session.org === 'r')
    const docs = await docsOrg1DB.find({
        selector:{
            "_id":{
                "$gt":null
            }
        }
    })

    //for org2 doc query idk if need but lagay ko nalang rinz - missy
    const docs2 = await docsOrg2DB.find({
        selector:{
            "_id":{
                "$gt":null
            }
        }
    })

    res.render("admin",{username : req.session.username,docs:docs, docs2:docs2});
})

module.exports = router