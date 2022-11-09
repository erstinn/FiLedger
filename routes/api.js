const express = require('express')
const router = express.Router()
<<<<<<< Updated upstream
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const userOrg1DB = nano.db.use('org1-users');
const userOrg2DB = nano.db.use('org2-users');
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');
=======
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const userdb = nano.db.use('users');
const docsdb = nano.db.use('org1-documents');// change db from documents to org1-documents
>>>>>>> Stashed changes
const bodyParser = require('body-parser')
router.use(bodyParser.json())

//TODO this is used in /admin/ url, invoked as soon as u enter http://127.0.0.1:3000/administration/admin
router.post('/users',async function (req,res){
    if(req.headers.access === "admin" && req.session.org==='org1') { //todo may change to if req.session.admin
        const users = await userOrg1DB.find({selector:{"_id":{"$gt":null}}})
        console.log(users.docs)
        res.send(users.docs);
    } else if (req.headers.access === "admin" && req.session.org==='org2'){
        const users = await userOrg2DB.find({selector:{"_id":{"$gt":null}}})
        res.send(users.docs);
    }
    else{
        res.status(401).send("Unauthorized Access");
    }
})

//TODO used on /admin
router.post('/docs', async (req,res)=>{
    console.log(req.session.org, 'balala momentstnghna')
    console.log(req.session.admin, 'fku');
    if(req.headers.access === 'admin' && req.session.org==='org1'){
        const docs = await docsOrg1DB.find({selector:{"_id":{"$gt":null}}})
        console.log(docs)
        res.send(docs.docs);
    }else if (req.headers.access === 'admin' && req.session.org==='org2'){
        const docs = await docsOrg2DB.find({selector:{"_id":{"$gt":null}}})
        res.send(docs.docs);
    }else{
        res.status(401).send("Unauthorized Access")
    }
})

//TODO used in /admin
router.put('/insert-docs',async(req,res)=>{
    //todo tnginang reduce the fkin boilerplaate
    if(req.headers.access === 'admin' && req.session.org==='org1') {
        const user = await userOrg1DB.find({selector:{"_id":req.body.userId}})
        user.docs[0]['documents'].push({document:req.body.document,access:req.body.access}) //todo wtf is this supposed to do
        await userOrg1DB.insert(user.docs[0],req.body.userId,(err)=>{
            if(err){
                res.send(err)
            }else{
                res.sendStatus(201)
            }
        });
    }else if(req.headers.access === 'admin' && req.session.org==='org2') {
        const user = await userOrg2DB.find({selector:{"_id":req.body.userId}})
        user.docs[0]['documents'].push({document:req.body.document,access:req.body.access}) //todo wtf is this supposed to do
        await userOrg2DB.insert(user.docs[0],req.body.userId,(err)=>{
            if(err){
                res.send(err)
            }else{
                res.sendStatus(201)
            }
        });
    }
})

//TODO used in pending-docs
//todo SHORTEN BOILERPLATE
// TODO OTHER USERS AS WELL
router.post('/acceptDocs',async(req,res)=>{
    if(req.session.org === 'org1') {
        const docs = await docsOrg1DB.get(req.body.docId);
        docs.status = "Accepted"
        const date = new Date();
        const state = `Accepted @ ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        docs.state_history.push(state)

        await docsOrg1DB.insert(docs,req.body.docId,err=>{
            if(err){
                res.send(err)
            }
            else{
                res.send(true)
            }
        })
    }else if(req.session.org === 'org2') {
        const docs = await docsOrg2DB.get(req.body.docId);
        docs.status = "Accepted"
        const date = new Date();
        const state = `Accepted @ ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        docs.state_history.push(state);
        await docsOrg1DB.insert(docs,req.body.docId,err=>{
            if(err){
                res.send(err)
            }
            else{
                res.send(true)
            }
        })
    }else{
        res.status(401).send("Unauthorized Access");
    }
})


//todo /pending-docs/
//TODO CHANGE SESSIONS [UTOEUTRE /PER  dept then org
//TODO MAKE BOILERPLAJTJERJTRKJTREKLT
router.post('/rejectDocs',async(req,res)=>{
    if( req.session.org==='org1') {
        const docs = await docsOrg1DB.get(req.body.docId);
        docs.status = "Rejected";
        const date = new Date();
        const state = `Rejected @ ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        docs.state_history.push(state)

        await docsOrg1DB.insert(docs, req.body.docId, err => {
            if (err) {
                res.send(err)
            } else {
                res.send(true)
            }
        });
    }else if( req.session.org==='org2'){
        const docs = await docsOrg2DB.get(req.body.docId);
        docs.status = "Rejected";
        const date = new Date();
        const state = `Rejected @ ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        docs.state_history.push(state)

        await docsOrg2DB.insert(docs, req.body.docId, err => {
            if (err) {
                res.send(err)
            } else {
                res.send(true)
            }
        });
    } else{
        res.status(401).send("Unauthorized Access");
    }
})

//todo /admin/
router.post('/getDocsOfUser',async(req,res)=>{
    if(req.session.admin && req.session.org === 'org1'){
        const docs = await userOrg1DB.get(req.body.userId);
        res.send(docs.documents);
    }else if(req.session.admin && req.session.org ==='org2'){
        const docs = await userOrg2DB.get(req.body.userId);
        res.send(docs.documents);
    }else{
        res.status(401).send("Unauthorized Access")
    }
})

//todo ====================================================== middleware ======================================================

module.exports = router