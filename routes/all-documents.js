const express = require('express')
const router = express.Router()
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');
const approverDB = nano.db.use('approvers');
const userDB = nano.db.use('users');



router.get('/',async(req,res)=>{
    console.log(req.session.approver);
    console.log(req.session.admin);
    console.log(req.session.user);
    if (req.session.admin===true) {
        const documents = await docsDB.find({
            selector: {
                _id: {
                    "$gt": null
                }
            }
        })
        res.render("all-documents",{docs:documents,username : req.session.username})
        console.log(documents);
        //TODO console.log(documents.docs[0].state_history[9]); code to access some array lol
        console.log('fk u asdklashd')
    }else if (req.session.approver===true){
        //simply to make sure it's an approver, probably not needed
        console.log(req.session.department)
        console.log("appotasetihjrit");

        const documents = await docsDB.find({
            selector: {
                "department": req.session.department
            }
        })
        res.render("all-documents",{docs:documents,username : req.session.username})
        console.log(documents);
    }else{
        //TODO uncomment pseudocode soon

        const user = await userDB.find({
            selector:{
                "department": req.session.department
            }
        })
        // const document = await docsDB.find({
        //     selector: {
        //         //TODO "department": responseApproverDB.docs[0].department @BALALA @BALALA
        //         ""
        //     }
        // })
        //selectors end
        const responseUserDB = await userDB.find(user);
        //fetch if align w dept of the creator? TODO MAYBE NOT
        //todo
        //  fetch all documents such that it matches username inside roles array (editor/viewer)
        // fetch by username == creator

        const responseDocsDB = await docsDB.find(user);
        res.render("all-documents",{docs:documents,username : req.session.username})
        //todo ent of soducod
        console.log('paprover')
        console.log(documents);
    }
    // res.render("all-documents",{docs:documents,username : req.session.username})
})


module.exports = router