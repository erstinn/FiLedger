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
        user.docs[0]['documents'].push({document:req.body.document,access:req.body.access,documentId:req.body.documentId}) //adds docs associate to user maybe editor, viewer, approver
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

//get all users of docs
router.post('/getUsersOfDoc',async(req,res)=>{
    const userz = req.session.currentUsersDB;
    let users = await userz.find({selector:{_id:{"$gt":null}} } )
    let matchedUsers = [] // array to store users with access to document
    users.docs.forEach(e=>{
        e.documents.forEach(f=>{
            if(f.documentId === req.body.documentId){//if user has access to doc
                let tempUsername = e.username 
                let tempAccess = f.access;
                matchedUsers.push({username:tempUsername,access:tempAccess})//stores array of object {username,access}
            }
        })
    })
    res.send(matchedUsers)//returns array of object of usernames and access
})
//deletes a certain docs and put on deleted db
router.post('/deleteDoc',async(req,res)=>{
    try{
        const docz = req.session.currentDocsDB; //get db
        const delDocz = req.session.currentDelDocsDB; //get db
        const rev = await docz.get(req.body.document)//get doc from db
        await docz.destroy(req.body.document,rev._rev)//delete from docdb

        delete rev._rev //if not removed insert will not work
        await delDocz.insert(rev)//save to deleted docsdb
    }catch(err){
        if(err){
            res.send(false)
        }else{
            res.send(true)
        }
    }
    
})
//deletes a certain user and put on deleted db
router.post('/deleteUser',async(req,res)=>{
    try{
        const userz = req.session.currentUsersDB;
        const delUserz = req.session.currentDelUsersDB;
        const rev = await userz.get(req.body.userId)
        await userz.destroy(req.body.userId,rev._rev)

        delete rev._rev
        await delUserz.insert(rev)
    }catch(err){
        if(err){
            res.send(false)
        }else{
            res.send(true)
        }
    }
    
})

//todo ====================================================== middleware ======================================================

module.exports = router