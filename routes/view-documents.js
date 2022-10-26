const express = require('express')
const router = express.Router()
//databases
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:mysecretpassword@127.0.0.1:5984/');
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');



router.get('/:id', async function (req,res){
    const data = await  docsDB.find({
        selector:{
            "_id":req.params.id
        }
    })
    res.render("view-documents",{data:data,username : req.session.username});
})

router.post('/delete/:id', async (req,res)=>{
    const rev = await docsDB.find({selector:{
        "_id":req.params.id
    }})
    await docsDB.destroy(req.params.id,rev.docs[0]._rev)
    res.redirect('/all-documents')
})

router.post('/downloads/:name',async(req,res)=>{
    const file = `uploads/${req.params.name}`;
    res.download(file,req.params.name)
})

module.exports = router