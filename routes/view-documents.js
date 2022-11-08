const express = require('express')
const router = express.Router()
//databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
//const nano = require('nano')('http://admin:mysecretpassword@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');
// const docsDB = nano.db.use('org1-documents');



router.get('/:id', async function (req,res){
    if (req.session.org==='org1'){
        const data = await  docsOrg1DB.find({selector:{"_id":req.params.id}})
        res.render("view-documents",{data:data,username : req.session.username});
    } else if (req.session.org==='org2'){
        const data = await  docsOrg2DB.find({selector:{"_id":req.params.id}})
        res.render("view-documents",{data:data,username : req.session.username});
    }
})

router.post('/delete/:id', async (req,res)=>{
    if (req.session.org==='org1'){
        const rev = await docsOrg1DB.find({selector:{"_id":req.params.id}})
        await docsOrg1DB.destroy(req.params.id,rev.docs[0]._rev)
        res.redirect('/all-documents')
    } else if (req.session.org==='org2') {
        const rev = await docsOrg2DB.find({selector: {"_id": req.params.id}})
        await docsOrg2DB.destroy(req.params.id, rev.docs[0]._rev)
        res.redirect('/all-documents')
    }
})

router.post('/downloads/:name',async(req,res)=>{
    console.log('download deputa')
    // const file = `uploads/${req.params.name}`;


    // res.download(file,req.params.name)
})

//todo ======================================= FUNCTIONS =======================================
function downloadAttachment (db, org){
    if (org==='org1'){
        const body = b.attachment.get('')
    }
}



module.exports = router