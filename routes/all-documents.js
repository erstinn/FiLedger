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

// const documents = await docsOrg1DB.find({selector: {
//         _id: {
//             "$gt": null
//         }
//     }});

// router.get('/', (req, res) => {
//     res.redirect('all-documents/1');
//     console.log("error")
// })

router.get('/',async(req,res)=>{
    const documents = await docsOrg1DB.find({
        selector: {
            _id: {
                "$gt": null
            }
        },
    })
    res.redirect('all-documents/1')
    // res.render('all-documents',{d:documents,username : req.session.username, page :req.params.page})

})

router.get('/:page',async(req,res)=>{
    console.log(req.session.approver);
    console.log(req.session.admin);
    console.log(req.session.user);
    const admin = req.session.admin;
    const user = req.session.user;
    const approver = req.session.approver;
    const s = req.query.sort;

    const documents = await docsOrg1DB.find({selector: {
        _id: {
            "$gt": null
        }
    }});
    console.log(documents.docs)
    console.log("cannot be reached");
    if (admin === true) {
        console.log("admin is logged in")
        console.log(req.params.page)
        if (Number(req.params.page) <= (Math.ceil(documents.docs.length / 10))) {
            if (req.query.sort === "title") {
                documents.docs = documents.docs.sort((a, b) => (a.name > b.name) ? 1 : -1)
            } else if (req.query.sort === 'type') {
                documents.docs = documents.docs.sort((a, b) => (a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase()) ? 1 : -1)
            } else if (req.query.sort === "size") {
                documents.docs = documents.docs.sort((a, b) => {
                    let unitA = a.size.split(" ")[1]
                    let unitB = b.size.split(" ")[1]
                    let valueA;
                    let valueB;
                    if (unitA === 'GB') {
                        valueA = parseFloat(a.size.split(' ')[0]) * 125000
                    } else if (unitA === 'MB') {
                        valueA = parseFloat(a.size.split(' ')[0]) * 125
                    } else if (unitA === 'KB') {
                        valueA = parseFloat(a.size.split(' ')[0])
                    }

                    if (unitB === 'GB') {
                        valueB = parseFloat(b.size.split(' ')[0]) * 125000
                    } else if (unitB === 'MB') {
                        valueB = parseFloat(b.size.split(' ')[0]) * 125
                    } else if (unitB === 'KB') {
                        valueB = parseFloat(b.size.split(' ')[0])
                    }
                    if (valueA > valueB) {
                        return 1
                    } else {
                        return -1
                    }
                })
            } else if (req.query.sort === "author") {
                documents.docs = documents.docs.sort((a, b) => (a.creator > b.creator) ? 1 : -1)
            } else if (req.query.sort === 'date') {
                documents.docs = documents.docs.sort((a, b) => (a.state_history.slice(-1) > b.state_history.slice(-1)) ? 1 : -1)
            } else {
                documents.docs = documents.docs.sort((a, b) => (a.name > b.name) ? 1 : -1)
            }
            res.render('all-documents', {username: req.session.username, d: documents, page: req.params.page, sort:s})
        } else {
            console.log('lol mali')
            // res.render()
            console.log("ADMIN")
            res.redirect("1")
        } //end of if else for pages
    }else{
        console.log("not admin")
    }

    // }else if (approver===true){
    //     //simply to make sure it's an approver, probably not needed
    //     console.log(req.session.department)
    //     console.log("appotasetihjrit");
    //
    //     const documents = await docsOrg1DB.find({
    //         selector: {
    //             "department": req.session.department
    //         }
    //     })
    //     res.render("all-documents",{docs:documents,username : req.session.username,page:req.params.page})
    //     console.log(documents);
    // }else{
    //     //user session
    //     //TODO uncomment pseudocode soon
    //
    //     const user = await userOrg1DB.find({
    //         selector:{
    //             "department": req.session.department
    //         }
    //     })
    //     // const document = await docsOrg1DB.find({
    //     //     selector: {
    //     //         //TODO "department": responseApproverDB.docs[0].department @BALALA @BALALA
    //     //         ""
    //     //     }
    //     // })
    //     //selectors end
    //     const responseUserDB = await userOrg1DB.find(user);
    //     //fetch if align w dept of the creator? TODO MAYBE NOT
    //     //todo
    //     //  fetch all documents such that it matches username inside roles array (editor/viewer)
    //     // fetch by username == creator
    //
    //     const responseDocsDB = await docsOrg1DB.find(user);
    //     res.render("all-documents",{d:documents,username : req.session.username,page:req.params.page})
    //     //todo ent of soducod
    //     console.log('paprover')
    //     console.log(documents);
    // }
    // // res.render("all-documents",{docs:documents,username : req.session.username})
    // res.render("all-documents",{d:documents,username : req.session.username,page:req.params.page})
    // console.log("lol exit non of the aboive")
})





module.exports = router