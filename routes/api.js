const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const fs = require("fs");
const path = require("path");
router.use(bodyParser.json())

//todo ====================================================== admin ======================================================
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
    const userz = req.session.currentUsersDB;
    const docz = req.session.currentDocsDB;
    if(req.session.admin) {
        try{
            const user = await userz.find({selector:{"_id":req.body.userId}})
            user.docs[0]['documents'].push({document:req.body.document,access:req.body.access,documentId:req.body.documentId}) //todo wtf is this supposed to do
            await userz.insert(user.docs[0],req.body.userId,(err)=>{
                if(err){
                    res.send(err)
                }
            });
    
            const docs = await docz.get(req.body.documentId)
            if(!docs.roles){
                docs.roles = {
                    approvers:[],
                    editors:[],
                    viewers:[]
                }
                docs.roles[`${req.body.access}s`].push(`${user.docs[0].firstname} ${user.docs[0].lastname}`);
            }else{
                docs.roles[`${req.body.access}s`].push(`${user.docs[0].firstname} ${user.docs[0].lastname}`);
            }
            await docz.insert(docs,req.body.documentId)
        }catch(err){
            if(err){
                res.send(err)
            }
        }
        res.sendStatus(201)
    }
})

//todo ====================================================== accepted-docs APPROVER/ADMIN ======================================================
router.post('/tagResubmit',async(req,res)=>{
    const docz = req.session.currentDocsDB;
    if(req.session.admin || req.session.approver) {
        const docs = await docz.get(req.body.docId);
        docs.status = "Resubmit";
        const date = new Date();
        const state = `Resubmit  @ ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        docs.state_history.push(state);

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

//todo ====================================================== rejected-docs ======================================================
// resubmit button, only visible for USER POV
//TODO reduce boilerplate
// router.post('/userReupload',async(req,res)=>{
//     const docz = req.session.currentDocsDB;
//     const tempPath = path.resolve(__dirname, `./../uploads/${req.file.originalname}`);
//     fs.writeFileSync(path.resolve(__dirname, `./../uploads/${req.file.originalname}`), file.buffer)
//     if(req.session.user) {
//         const docs = await docz.get(req.body.docId);
//         if (req.file.originalname !== docs.name)
//             return;
//         console.log(req.file.originalname, 'req.file.originalname')
//         console.log(docs.name, 'docs.name')
//         docs.status = "Pending"
//         const date = new Date();
//         const state = `Pending @ ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
//         docs.state_history.push(state)
//         await docz.insert(docs,req.body.docId,err=>{
//             if(err){
//                 res.send(err)
//             }
//             else{
//                 res.send(true)
//             }
//         })
//         const FULLNAME = req.session.firstname + " " + req.session.lastname;
//         const q = {
//             selector: {
//                 "name": req.file.originalname,
//                 "creator":  FULLNAME//todo there is still a what if for deleted accs.. :)
//             }
//         };
//         const frev = await docz.find(q);
//         const revi = frev[0]._rev;
//         console.log(revi ,'revi');
//         fs.readFile(tempPath, async (err, data) => { //dno if async
//             await docz.attachment.insert(req.body.docId, req.file.originalname, data, file.mimetype, {}) //todo this should be attachment
//                 if (err)
//                     console.log('resubmit failURE: ', err)
//         });
//     }else{
//         res.status(401).send("Unauthorized Access");
//     }
// })

//todo ====================================================== pending-docs ======================================================
//used in pending-docs: ACCEPT BUTTON
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


//used on /pending-docs/ REJECT BUTTON
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
    const docz = req.session.currentUsersDB;
    if(req.session.admin){
        const docs = await docz.get(req.body.userId);
        res.send(docs.documents);
    }else{
        res.status(401).send("Unauthorized Access")
    }
})

//todo ======================================== ADMINISTRATIOPN ========================================
router.post('/changeAccess',async(req,res)=>{
    const docz = req.session.currentDocsDB;
    const docs = await docz.get(req.body.documentId);
    const userz = req.session.currentUsersDB;
    const users = await userz.get(req.body.userId);
    let temp = users['documents']
    let index = temp.findIndex(x=>x.document === req.body.document)
    temp[index].access = req.body.newAccess;
    users.documents = temp;

    let Dtemp = docs.roles[`${req.body.oldAccess}s`]
    console.log(Dtemp)
    index = Dtemp.findIndex(x=>`${x.firstname} ${x.lastname}` === `${users.firstname} ${users.lastname}`)
    Dtemp.splice(index,1);
    docs.roles[`${req.body.oldAccess}s`] = Dtemp

    Dtemp = docs.roles[`${req.body.newAccess}s`]
    Dtemp.push(`${users.firstname} ${users.lastname}`)
    docs.roles[`${req.body.newAccess}s`] = Dtemp

    await docz.insert(docs,req.session.documentId)
    await userz.insert(users,req.body.userId);



    res.send(true)

})

router.post('/delDocOfUser',async(req,res)=>{
        const docz = req.session.currentDocsDB;
        const docs = await docz.get(req.body.documentId)
        const userz = req.session.currentUsersDB;
        const users = await userz.get(req.body.userId);
        let Utemp = users['documents']
        let index = Utemp.findIndex(x=>x.document === req.body.document)
        Utemp.splice(index,1)
        users.documents = Utemp;

        let Dtemp = docs.roles[`${req.body.access}s`]
        console.log(Dtemp)
        index = Dtemp.findIndex(x=>`${x.firstname} ${x.lastname}` === `${users.firstname} ${users.lastname}`)
        Dtemp.splice(index,1);

        docs.roles[`${req.body.access}s`] = Dtemp
    
        await userz.insert(users,req.body.userId);
        await docz.insert(docs,req.body.documentId)
    
   
        res.send(true)

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
    console.log(matchedUsers)
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