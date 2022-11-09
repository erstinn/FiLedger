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


router.use(setSessionDocsDB);
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

function setSessionDocsDB(req, res, next){ //bobo ko bat di ko ginawa una palang 🤡
    if (req.session.org==='org1'){
        req.session.currentDocsDB = docsOrg1DB;
    }else{
        req.session.currentDocsDB = docsOrg2DB;
    }
    next();
}
module.exports = router;

