const express = require('express')
const router = express.Router()
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// const docsDB = nano.db.use('documents');
// const approverDB = nano.db.use('approvers');
// const userDB = nano.db.use('users');

//di parin pinalitan dbs pota ako pa nagpalit
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');
const userOrg1DB = nano.db.use('org1-users');
const userOrg2DB = nano.db.use('org2-users');

router.get('/:page',async(req,res)=>{
    const docs = req.session.currentDocsDB;
    // const docz = req.session.currentDocsDB;
    const documents = await docs.find({
        selector: {
            _id: {
                "$gt": null
            }
        },
    })
    if (req.session.admin===true) {
            if(Number(req.params.page) <= Math.ceil(documents.docs.length/10)){
                let doc;
            if(req.query.sort === "title"){
                doc = documents.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
            }
            else if(req.query.sort === 'type'){
                doc = documents.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
            }
            else if(req.query.sort === "size"){
                doc = documents.docs.sort((a,b)=>{
                    let unitA = a.size.split(" ")[1]
                    let unitB = b.size.split(" ")[1]
                    let valueA;
                    let valueB;
                    if(unitA === 'GB'){
                        valueA = parseFloat(a.size.split(' ')[0]) * 125000
                    }
                    else if(unitA === 'MB'){
                        valueA = parseFloat(a.size.split(' ')[0]) * 125
                    }
                    else if(unitA === 'KB'){
                        valueA = parseFloat(a.size.split(' ')[0])
                    }

                    if(unitB === 'GB'){
                        valueB = parseFloat(b.size.split(' ')[0]) * 125000
                    }
                    else if(unitB === 'MB'){
                        valueB = parseFloat(b.size.split(' ')[0]) * 125
                    }
                    else if(unitB === 'KB'){
                        valueB = parseFloat(b.size.split(' ')[0])
                    }
                    if(valueA > valueB){
                        return 1
                    }
                    else{
                        return -1
                    }
                })
            }else if(req.query.sort === "author"){
                doc = documents.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
            }else if(req.query.sort === 'date'){
                doc = documents.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
            } else{
                doc = documents.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
            }
            res.render("all-documents",{doc:documents,username : req.session.username,page:req.params.page,sort:req.query.sort})
            console.log("docs:",doc);
        }else{
            res.redirect("1")
        }
    }else if (req.session.approver===true){
        //NOT FINAL
        //simply to make sure it's an approver, probably not needed
        const docApprover = await docs.find({
            selector: {
                "department": req.session.department
            }
        })
        if(Number(req.params.page) <= Math.ceil(docApprover.docs.length/10)){
            let doc;
            if(req.query.sort === "title"){
                doc = docApprover.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
            }
            else if(req.query.sort === 'type'){
                doc = docApprover.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
            }
            else if(req.query.sort === "size"){
                doc = docApprover.docs.sort((a,b)=>{
                    let unitA = a.size.split(" ")[1]
                    let unitB = b.size.split(" ")[1]
                    let valueA;
                    let valueB;
                    if(unitA === 'GB'){
                        valueA = parseFloat(a.size.split(' ')[0]) * 125000
                    }
                    else if(unitA === 'MB'){
                        valueA = parseFloat(a.size.split(' ')[0]) * 125
                    }
                    else if(unitA === 'KB'){
                        valueA = parseFloat(a.size.split(' ')[0])
                    }

                    if(unitB === 'GB'){
                        valueB = parseFloat(b.size.split(' ')[0]) * 125000
                    }
                    else if(unitB === 'MB'){
                        valueB = parseFloat(b.size.split(' ')[0]) * 125
                    }
                    else if(unitB === 'KB'){
                        valueB = parseFloat(b.size.split(' ')[0])
                    }
                    if(valueA > valueB){
                        return 1
                    }
                    else{
                        return -1
                    }
                })
            }else if(req.query.sort === "author"){
                doc = docApprover.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
            }else if(req.query.sort === 'date'){
                doc = docApprover.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
            } else{
                doc = docApprover.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
            }
            res.render("all-documents",{doc:documents,username : req.session.username,page:req.params.page,sort:req.query.sort})
            console.log("docs:",doc);
        }else{
            res.redirect("1")
        }
        // res.render("all-documents",{docs:docApprover,username : req.session.username,page:req.params.page, sort:req.query.sort})
        // console.log(documents);
    }else{
        //NOT FINAL
        const FULLNAME = req.session.firstname + " " + req.session.lastname;
        const documents = await docs.find({
            selector: {
                _id: {"$gt": null},
                // "status": "Accepted",
                "$or":[
                    {"creator": FULLNAME},
                    {
                        roles: { //matches one of array :----------------D
                            viewers: {
                                "$elemMatch":{
                                    "$eq" : FULLNAME
                                }
                            },
                        } //end of roles ARRAY
                    },
                    {
                        roles: {
                            editors: {
                                "$elemMatch":{
                                    "$eq" : FULLNAME
                                }
                            },
                        } //end of roles ARRAY
                    }
                ],
                department: req.session.department
            }
        })

        if(Number(req.params.page) <= Math.ceil(documents.docs.length/10)){
            let doc;
            if(req.query.sort === "title"){
                doc = documents.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
            }
            else if(req.query.sort === 'type'){
                doc = documents.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
            }
            else if(req.query.sort === "size"){
                doc = documents.docs.sort((a,b)=>{
                    let unitA = a.size.split(" ")[1]
                    let unitB = b.size.split(" ")[1]
                    let valueA;
                    let valueB;
                    if(unitA === 'GB'){
                        valueA = parseFloat(a.size.split(' ')[0]) * 125000
                    }
                    else if(unitA === 'MB'){
                        valueA = parseFloat(a.size.split(' ')[0]) * 125
                    }
                    else if(unitA === 'KB'){
                        valueA = parseFloat(a.size.split(' ')[0])
                    }

                    if(unitB === 'GB'){
                        valueB = parseFloat(b.size.split(' ')[0]) * 125000
                    }
                    else if(unitB === 'MB'){
                        valueB = parseFloat(b.size.split(' ')[0]) * 125
                    }
                    else if(unitB === 'KB'){
                        valueB = parseFloat(b.size.split(' ')[0])
                    }
                    if(valueA > valueB){
                        return 1
                    }
                    else{
                        return -1
                    }
                })
            }else if(req.query.sort === "author"){
                doc = documents.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
            }else if(req.query.sort === 'date'){
                doc = documents.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
            } else{
                doc = documents.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
            }
            res.render("all-documents",{doc:documents,username : req.session.username,page:req.params.page,sort:req.query.sort})
            console.log("docs:",doc);
        }else{
            res.redirect("1")
        }

        //TODO uncomment pseudocode soon
        // const user = await docs.find({
        //     selector:{
        //         "department": req.session.department
        //     }
        // })
        // // const document = await docsOrg1DB.find({
        // //     selector: {
        // //         //TODO "department": responseApproverDB.docs[0].department @BALALA @BALALA
        // //         ""
        // //     }
        // // })
        // //selectors end
        // const responseUserDB = await docs.find(user);
        // //fetch if align w dept of the creator? TODO MAYBE NOT
        // //todo
        // //  fetch all documents such that it matches username inside roles array (editor/viewer)
        // // fetch by username == creator
        //
        // const responseDocsDB = await docs.find(user);
        // res.render("all-documents",{docs:documents,username : req.session.username,page:req.params.page})
        // //todo ent of soducod
        // console.log('paprover')
        // console.log(documents);
    }
    // res.render("all-documents",{doc:documents,username : req.session.username, page:req.params.page, sort:req.query.sort})
})

router.get('/',(req,res)=>{
    res.redirect('all-documents/1')
})


module.exports = router