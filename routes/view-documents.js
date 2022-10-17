const express = require('express')
const router = express.Router()
//databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');



router.get('/:id', async function (req,res){
    const data = await  docsDB.find({
        selector:{
            "_id":req.params.id
        }
    })
    res.render("view-documents",{data:data});
})

module.exports = router