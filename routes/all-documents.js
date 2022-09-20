const express = require('express')
const router = express.Router()
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');



router.get('/',async(req,res)=>{
    const documents = await docsDB.find({selector:{
        _id:{
            "$gt":null
        }
    }})
    res.render("all-documents",{docs:documents})
})


module.exports = router