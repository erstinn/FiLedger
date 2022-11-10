const express = require('express')
const router = express.Router()
const path = require('path');
const fs = require('fs');
const http = require('https');
const axios = require('axios')
//databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
//const nano = require('nano')('http://admin:mysecretpassword@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');
// const docsDB = nano.db.use('org1-documents');
let mimeType = require('./mimeType');
// maps file extension to MIME types
// full list can be found here: https://www.freeformatter.com/mime-types-list.html




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
    const doc = await docsOrg1DB.find({
        selector: {
            "name": req.params.name
        }
    });
    // const file = `uploads/${req.params.name}`;
    console.log(req.body.name);
    if(req.session.admin && req.session.org === 'org1') {
        // const filename = docsOrg1DB.attachment.get(req.params._id,req.params.name);
        const filePath =`downloads/${req.params.name}`;
        const stream = fs.createReadStream(filePath);

        // res.setHeader('Content-Disposition', `image/jpeg; media-type=${req.params.name}` )
        //text file palang gumagana idk how sa image and docx
        res.setHeader('Content-type',`application/${req.params.type}`)
        // res.setHeader('Content-type','')
        // res.setHeader('Content-Type', 'image/jpeg');
        // res.setHeader('Content-Type', 'text/html');
        // res.set('Content-Type', 'image/jpeg');
        // res.setHeader('Content-Type', 'image/png');
        // res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${req.params.name}"`);
        stream.pipe(res);

        stream.on("error", function (err){
            console.log("Error in writing to the stream");
            console.log(err);
        })

       stream.on("finish",function (){
            stream.close();
            console.log("Download done!")
        })


    }
    res.render('view-documents',{data:doc, username:req.session.username})
    // res.download(file,req.params.name)
})

//todo ======================================= FUNCTIONS =======================================
function downloadAttachment (db, org){
    if (org==='org1'){
        const body = b.attachment.get('')
    }
}



module.exports = router
