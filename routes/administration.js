const express = require('express')
const router = express.Router()
<<<<<<< Updated upstream
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');
=======
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');
>>>>>>> Stashed changes


router.get('/admin',async function (req,res){
    // if (req.session.org === 'r')
    const docs = await docsDB.find({
        selector:{
            "_id":{
                "$gt":null
            }
        }
    })

    res.render("admin",{username : req.session.username,docs:docs.docs});
})

module.exports = router