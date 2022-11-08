const express = require('express')
const router = express.Router()
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const userdb = nano.db.use('users');
const docsdb = nano.db.use('org1-documents');// change db from documents to org1-documents
const bodyParser = require('body-parser')
router.use(bodyParser.json())


router.post('/users',async function (req,res){
    if(req.headers.access === "admin"){
        const users = await userdb.find({
            selector:{
                "_id":{
                    "$gt":null
                }
            }
        })
        res.send(users.docs)
    }
    else{
        res.status(401).send("Unauthorized Access")
    }
})

router.post('/docs', async (req,res)=>{
    if(req.headers.access === 'admin'){
        const docs = await docsdb.find({
            selector:{
                "_id":{"$gt":null}
            }
        })
        res.send(docs.docs)
    }else{
        res.status(401).send("Unauthorized Access")
    }
})

router.put('/insert-docs',async(req,res)=>{
    // console.log(req.body.document)
    // console.log(req.body.access)
    // console.log(req.body.userId)
    let user = await userdb.find({
        selector:{"_id":req.body.userId}
    })
    user.docs[0]['documents'].push({document:req.body.document,access:req.body.access})
    await userdb.insert(user.docs[0],req.body.userId,(err)=>{
        if(err){
            res.send(err)
        }else{
            res.sendStatus(201)
        }
    });
})

router.post('/acceptDocs',async(req,res)=>{
    if(req.headers.access =="admin"){
        const docs = await docsdb.get(req.body.docId);
        docs.status = "Accepted"
        const date = new Date();
        const state = `Accepted @ ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` 
        docs.state_history.push(state)

        await docsdb.insert(docs,req.body.docId,err=>{
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

router.post('/rejectDocs',async(req,res)=>{
    if(req.headers.access =="admin"){
        const docs = await docsdb.get(req.body.docId);
        docs.status = "Rejected";
        const date = new Date();
        const state = `Rejected @ ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` 
        docs.state_history.push(state)

        await docsdb.insert(docs,req.body.docId,err=>{
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

router.post('/getDocsOfUser',async(req,res)=>{
    if(req.headers.access === 'admin'){
        const docs = await userdb.get(req.body.userId);
        res.send(docs.documents)
    }else{
        res.status(401).send("Unauthorized Access")
    }
})

module.exports = router