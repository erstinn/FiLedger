const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
router.use(bodyParser.json())

//used on /admin
router.post('/users',async function (req,res){
    const docz = req.session.currentUsersDB;
    if(req.session.admin) {
        const users = await docz.find({selector:{_id:{"$gt":null}} } )
        console.log(users.docs)
        res.send(users.docs);
    } else{
        res.status(401).send("Unauthorized Access");
    }
})

// used on /admin
router.post('/docs', async (req,res)=>{
    const docz = req.session.currentDocsDB;
    if(req.session.admin){
        const docs = await docz.find({selector:{_id:{"$gt":null}}})
        res.send(docs.docs);
    }else{
        res.status(401).send("Unauthorized Access")
    }
})

// used on /admin
router.put('/insert-docs',async(req,res)=>{
    const docz = req.session.currentUsersDB;
    if(req.session.admin) {
        const user = await docz.find({selector:{"_id":req.body.userId}})
        user.docs[0]['documents'].push({document:req.body.document,access:req.body.access}) //adds docs associate to user maybe editor, viewer, approver
        await docz.insert(user.docs[0],req.body.userId,(err)=>{
            if(err){
                res.send(err)
            }else{
                res.sendStatus(201)
            }
        });
    }
})

//used in pending-docs
router.post('/acceptDocs',async(req,res)=>{
    const docz = req.session.currentDocsDB;
    if(req.session.admin || req.session.approver) {
        const docs = await docz.get(req.body.docId);
        docs.status = "Accepted"
        const date = new Date();
        const state = `Accepted @ ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        docs.state_history.push(state)

        await docz.insert(docs,req.body.docId,err=>{
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


//used on /pending-docs/
router.post('/rejectDocs',async(req,res)=>{
    const docz = req.session.currentDocsDB;
    if( req.session.admin || req.session.approver) {
        const docs = await docz.get(req.body.docId);
        docs.status = "Rejected";
        const date = new Date();
        const state = `Rejected @ ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        docs.state_history.push(state)
        await docz.insert(docs, req.body.docId, err => {
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

//used on /admin/
router.post('/getDocsOfUser',async(req,res)=>{
    const userz = req.session.currentUsersDB;
    if(req.session.admin){
        const users = await userz.get(req.body.userId);
        res.send(users.documents);
    }else{
        res.status(401).send("Unauthorized Access")
    }
})


//delete docs associated to user
router.post('/delDocOfUser',async(req,res)=>{
    const userz = req.session.currentUsersDB;
    const users = await userz.get(req.body.userId);
    let temp = users['documents']
    let index = temp.findIndex(x=>x.document === req.body.document)
    temp.splice(index,1)
    users.documents = temp;

    await userz.insert(users,req.body.userId,(err)=>{
        if(err){
            res.send(false)
        }else{
            res.send(true)
        }
    });
    
})

router.post('/changeAccess',async(req,res)=>{
    const userz = req.session.currentUsersDB;
    const users = await userz.get(req.body.userId);
    let temp = users['documents']
    let index = temp.findIndex(x=>x.document === req.body.document)
    temp[index].access = req.body.newAccess;
    users.documents = temp;
    await userz.insert(users,req.body.userId,(err)=>{
        if(err){
            res.send(false)
        }else{
            res.send(true)
        }
    });
    
})

//todo ====================================================== middleware ======================================================

module.exports = router