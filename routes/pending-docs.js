const express = require('express')
const router = express.Router()
const fs = require("fs")
const path = require('path')

router.use(setDocz);
router.get('/', async(req,res)=>{
    if (req.session.admin ||req.session.approver) {
        res.redirect('pending-docs/1');
    }else {
        res.redirect('user-pending-docs/1');
    }

})


router.get("/:page",async(req,res)=>{
    const docz = req.session.docz;
    if(docz.docs.length <= 0){
        if (req.session.admin ||req.session.approver) {
            res.render('pending-docs', {username: req.session.username, doc3: docz, page: req.params.page})
        }else{
            res.render('user-pending-docs', {username: req.session.username, doc3: docz, page: req.params.page})
        }
        return
    }
    if(Number(req.params.page) <= (Math.ceil(docz.docs.length/10))){
        //query for updating the status in each json doc
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
                } else if(unitB === 'MB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125
                }else if(unitB === 'KB'){
                    valueB = parseFloat(b.size.split(' ')[0])
                }if(valueA > valueB){
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
            res.render("pending-docs", {doc3: docz, username: req.session.username, page: req.params.page, sort: req.query.sort})
        }else{
            res.render("user-pending-docs", {doc3: docz, username: req.session.username, page: req.params.page, sort: req.query.sort})
        }
    }else{
        if (req.session.admin ||req.session.approver) {
            res.redirect('pending-docs/1')
        }else{
            res.redirect('user-pending-docs/1')
        }
    }
})

//todo ======================================= ACTUAL MIDDLEWARES =======================================
//todo this is not tested yet for a diff pov
//pls do ignore errors lolol
async function setDocz(req, res, next) {
    const docsDB = req.session.currentDocsDB; //this is nano.db.use :D
    if (req.session.admin)
        req.session.docz = await docsDB.find({selector: {_id: {"$gt": null}, status: "Pending"}})
    if (req.session.approver)
        req.session.docz = await docsDB.find({selector: {_id: {"$gt": null}, status: "Pending", department: req.session.department}})
    if (req.session.user) { //USER POV=================================================================================
        //hahaha :-0
        const FULLNAME = req.session.firstname + " " + req.session.lastname;
        console.log(FULLNAME, "pano pako nakakatayo", req.session.department);
        req.session.docz = await docsDB.find({
            selector: {
                _id: {"$gt": null},
                "status": "Pending",
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
    }
    next();
}

module.exports = router;
