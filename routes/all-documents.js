const express = require('express')
const router = express.Router()
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');
const approverDB = nano.db.use('approvers');
const userDB = nano.db.use('users');



router.get('/:page',async(req,res)=>{
    console.log(req.session.approver);
    console.log(req.session.admin);
    console.log(req.session.user);

    if (req.session.admin===true) {
        const documents = await docsDB.find({
            selector: {
                _id: {
                    "$gt": null
                }
            },
        })
        let docs;
        if(req.query.sort == "title"){
            docs = documents.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        else if(req.query.sort == 'type'){
            docs = documents.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
        }
        else if(req.query.sort == "size"){
            docs = documents.docs.sort((a,b)=>{
                let unitA = a.size.split(" ")[1]
                let unitB = b.size.split(" ")[1]
                let valueA;
                let valueB;
                if(unitA == 'GB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125000
                }
                else if(unitA == 'MB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125
                }
                else if(unitA == 'KB'){
                    valueA = parseFloat(a.size.split(' ')[0])
                }

                if(unitB == 'GB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125000
                }
                else if(unitB == 'MB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125
                }
                else if(unitB == 'KB'){
                    valueB = parseFloat(b.size.split(' ')[0])
                }
                if(valueA > valueB){
                    return 1
                }
                else{
                    return -1
                }
            })
        }else if(req.query.sort == "author"){
            docs = documents.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
        }else if(req.query.sort == 'date'){
            docs = documents.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
        }
        else{
            docs = documents.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        res.render("all-documents",{docs:docs,username : req.session.username,page:req.params.page,sort:req.query.sort})
        console.log("docs:",docs);
    }else if (req.session.approver===true){
        //simply to make sure it's an approver, probably not needed
        console.log(req.session.department)
        console.log("appotasetihjrit");

        const documents = await docsDB.find({
            selector: {
                "department": req.session.department
            }
        })
        res.render("all-documents",{docs:documents,username : req.session.username,page:req.params.page})
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
        res.render("all-documents",{docs:documents,username : req.session.username,page:req.params.page})
        //todo ent of soducod
        console.log('paprover')
        console.log(documents);
    }
    // res.render("all-documents",{docs:documents,username : req.session.username})
})

router.get('/',(req,res)=>{
    res.redirect('all-documents/1')
})


module.exports = router