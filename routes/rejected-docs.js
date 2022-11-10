const express = require('express')
const router = express.Router()
const fs = require("fs")
const path = require('path')


router.get('/', async(req,res)=>{
    console.log(req.session.admin);
    if (req.session.admin ||req.session.approver) {
        res.redirect('rejected-docs/1');
    }else {
        res.redirect('user-rejected-docs/1');
    }
})

router.get("/:page",async(req,res)=>{
    docsDB = req.session.currentDocsDB;
    let docz = await docsDB.find({selector:{
            _id:{
                "$gt":null
            },
            status:"Rejected"
        }})
    //checks if there are docs TODO may remove
    if(docz.docs.length <= 0){
        if (req.session.admin ||req.session.approver) {
            res.render('rejected-docs', {username: req.session.username, doc2: docz, page: req.params.page})
        }else{
            res.render('user-rejected-docs', {username: req.session.username, doc2: docz, page: req.params.page})
        }
        return
    }
    if(Number(req.params.page) <= (Math.ceil(docz.docs.length/10))){
        if(req.query.sort === "title"){
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        else if(req.query.sort === 'type'){
            docz.docs = docz.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
        }
        else if(req.query.sort === "size"){
            docz.docs = docz.docs.sort((a,b)=>{
                let unitA = a.size.split(" ")[1]
                let unitB = b.size.split(" ")[1]
                let valueA;
                let valueB;
                if(unitA === 'GB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125000
                }else if(unitA === 'MB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125
                } else if(unitA === 'KB'){
                    valueA = parseFloat(a.size.split(' ')[0])
                }if(unitB === 'GB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125000
                }else if(unitB === 'MB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125
                }else if(unitB === 'KB'){
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
            docz.docs = docz.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
        }else if(req.query.sort === 'date'){
            docz.docs = docz.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
        }
        else{
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        if (req.session.admin ||req.session.approver) {
            res.render('rejected-docs',{username:req.session.username,doc2:docz,page:req.params.page})
        }else{
            res.render('user-rejected-docs',{username:req.session.username,doc2:docz,page:req.params.page})
        }
    }
    else{
        if (req.session.admin ||req.session.approver) {
            res.redirect("rejected-docs/1")
        }else{
            res.redirect("user-rejected-docs/1")
        }
    }
})



async function setDocz(req, res, next) {
    if (req.session.admin)
        req.session.docz = await docsDB.find({selector: {_id: {"$gt": null}, status: "Rejected"}})
    if (req.session.approver)
        req.session.docz = await docsDB.find({selector: {_id: {"$gt": null}, status: "Rejected", department: req.session.department}})
    if (req.session.user) //todo tngina, querying of the array na relevant documents
        req.session.docz = await docsDB.find({selector: {_id: {"$gt": null}, status: "Rejected"}})
    next();
}


function approverAdminQuery(){

}

module.exports = router;

