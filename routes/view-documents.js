const express = require('express')
const router = express.Router()
const path = require('path');
const fs = require('fs');
const http = require('https');
const axios = require('axios')
const FileSaver = require('file-saver');
const query = require('../network/chaincode/javascript/queryDoc')
//databases
const serverip = '127.0.0.1'
const nano = require('nano')(`http://admin:admin@${serverip}:5984/`);
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');
// const docsDB = nano.db.use('org1-documents');
// let mimeType = require('./mimeType');
// maps file extension to MIME types
// full list can be found here: https://www.freeformatter.com/mime-types-list.html



router.get('/:id', async function (req,res){
    //TODO: make this into a function if using pa sa ibang parts
    var user = '';
    var ver = '';
    // var timestamp = [];
    let data = '';
    if(req.session.admin){
        user = 'enroll';
    }
    else{
        user = req.session.username;
    }

    if (req.session.org==='org1'){
        data = await docsOrg1DB.find({selector:{"_id":req.params.id}})
        ver = await query.queryDoc(user, req.session.admin, req.session.approver, req.session.org, data.docs[0]._id);
        var timestamp = ver.state_history.split(',');
        res.render("view-documents",{data:data,username : req.session.username, ver:ver, timestamp:timestamp});
    } else if (req.session.org==='org2'){
        data = await docsOrg2DB.find({selector:{"_id":req.params.id}})
        ver = await query.queryDoc(user, req.session.admin, req.session.approver, req.session.org, data.docs[0]._id);
        var timestamp = ver.state_history.split(',');
        res.render("view-documents",{data:data,username : req.session.username, ver:ver, timestamp:timestamp});
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

    var user = '';
    var ver = '';
    // var timestamp = [];
    let timestamp;
    let data = '';
    if(req.session.admin){
        user = 'enroll';
    }
    else{
        user = req.session.username;
    }
    if (req.session.org==='org1'){
        data = await docsOrg1DB.find({selector:{"_id":req.params.id}})
        ver = await query.queryDoc(user, req.session.admin, req.session.approver, req.session.org, data.docs[0]._id);
        timestamp = ver.state_history.split(',');
        //download
        const filePath =`downloads/${req.params.name}`;
        const stream = fs.createReadStream(filePath);

        res.setHeader('Content-type',`application/${req.params.type}`)
        // res.setHeader('Content-type','image/jpeg');
        res.setHeader('Content-Disposition', `inline; filename="${req.params.name}"`);
        stream.pipe(res);

        stream.on("error", function (err){
            console.log("Error in writing to the stream");
            console.log(err);
        })

        stream.on("finish",function () {
            stream.close();
            console.log("Download done!")
        })

        res.render("view-documents",{data:data,username : req.session.username, ver:ver, timestamp:timestamp});
    } else if (req.session.org==='org2'){
        data = await docsOrg2DB.find({selector:{"_id":req.params.id}})
        ver = await query.queryDoc(user, req.session.admin, req.session.approver, req.session.org, data.docs[0]._id);
        timestamp = ver.state_history.split(',');
        //download
        const filePath =`./Downloads/${req.params.name}`;
        const stream = fs.createReadStream(filePath);
        res.setHeader('Content-type',`application/${res.type}`)
        res.setHeader('Content-Disposition', `inline; filename="${res.type}"`);
        stream.pipe(res);

        stream.on("error", function (err){
            console.log("Error in writing to the stream");
            console.log(err);
        })

        stream.on("finish",function (){
            stream.close();
            console.log("Download done!")
        })

        res.render("view-documents",{data:data,username : req.session.username, ver:ver, timestamp:timestamp});
    }

})

//todo ======================================= FUNCTIONS =======================================
// function downloadAttachment (db, org){
//     if (org==='org1'){
//         const body = b.attachment.get('')
//     }
// }

module.exports = router
