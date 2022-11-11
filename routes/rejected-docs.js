const express = require('express')
const router = express.Router()
const fs = require("fs")
const path = require('path')

router.use(setDocz);
//idkl if ill need this yet:
router.use(getApproverInTheDept); // in line setDocz, it's rly hard to query the document in question or i am just dumb; so i just get current approver/s? in related per dept

router.get('/', async(req,res)=>{
    console.log(req.session.admin);
    if (req.session.admin ||req.session.approver) {
        res.redirect('rejected-docs/1');
    }else {
        res.redirect('user-rejected-docs/1');
    }
})

router.get("/:page",async(req,res)=>{
    const docz = req.session.docz;
    console.log(docz, 'courage trhe coriler dog');
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


//todo ======================================= ACTUAL MIDDLEWARES =======================================
//pls do ignore errors lolol
async function setDocz(req, res, next) {
    const docsDB = req.session.currentDocsDB; //this is nano.db.use :D
    if (req.session.admin) {
        req.session.docz = await docsDB.find({
            selector: {
                _id: {"$gt": null},
                "$or": [{status: "Rejected"}, {status: "Resubmit"}]
            }
        })
    }
    if (req.session.approver) {
        req.session.docz = await docsDB.find({
            selector: {
                _id: {"$gt": null},
                "$or": [{status: "Rejected"}, {status: "Resubmit"}],
                department: req.session.department
            }
        })
    }
    if (req.session.user) {
        //hahaha :-0
        const FULLNAME = req.session.firstname + " " + req.session.lastname;
        console.log(FULLNAME, "pano pako nakakatayo", req.session.department);
        req.session.docz = await docsDB.find({
            selector: {
                _id: {"$gt": null},
                "status": "Resubmit",
                "$or":[
                    {"creator": FULLNAME},
                    {
                        roles: { //torsdo remove this if it doesnt query in editors/viewers
                            viewers: {
                                "$elemMatch":{
                                    "$eq" : FULLNAME
                                }
                            },
                        } //end of roles ARRAY
                    },
                    {
                        roles: { //torsdo remove this if it doesnt query in editors/viewers
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
    }
    next();
}

async function getApproverInTheDept(req, res, next) { //TODO PASS THIS TO EJS, or not tbh idk what it does yet
    const approverDB = req.session.currentApproversDB;
    req.session.deptApprover = await approverDB.find({
        selector: {
            _id: {"$gt": null},
            department: req.session.department
        }
    })
    next();
}


function approverAdminQuery(){

}

module.exports = router;

