const express = require('express')
const router = express.Router()
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const userdb = nano.db.use('users');
const docsdb = nano.db.use('documents');


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

module.exports = router