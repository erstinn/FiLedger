const express = require('express')
const router = express.Router()
const fs = require("fs")
const path = require('path')
// databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const docsOrg1DB = nano.db.use('org1-documents');
const docsOrg2DB = nano.db.use('org2-documents');
const userOrg1DB = nano.db.use('org1-users');
const userOrg2DB = nano.db.use('org2-users');
const docViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented



router.get('/',async(req,res)=>{
    res.redirect('pending-docs/1');
})


router.get("/:page",async(req,res)=>{
    //query for fetching all docs in documents DB

    const docz = await docsOrg1DB.find({selector:{
            _id:{
                "$gt":null
            },
            status:"Pending"
        }})
    if(Number(req.params.page) <= (Math.ceil(docz.docs.length/10))){
        const accepted = req.body.accept;
        const user = req.session.user;
        const admin = req.session.admin;
        const approver = req.session.approver;

        //query for updating the status in each json doc
        const state = await docsOrg1DB.find({selector:{
                _id:{
                    "$gt":null
                },
                "status": req.params.status,
                "name": req.params.name
                // "department":
            }})

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
            docz.docs = docz.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
        }else if(req.query.sort === 'date'){
            docz.docs = docz.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
        }
        else{
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        res.render("pending-docs", {doc3: docz, username: req.session.username,page:req.params.page})
    }else{
        res.redirect('pending-docs/1') //todo DID NOT TEST YET, MAY PRODUCE AN ERROR
    }
    const accepted = req.body.accept;
    const admin = req.session.admin;
    const approver = req.session.approver;
})



module.exports = router;
