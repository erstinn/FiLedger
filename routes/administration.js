const express = require('express')
const router = express.Router()

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