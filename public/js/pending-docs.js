//trial code only for accept and reject button
// const express = require('express')
// const router = express.Router()
// const fs = require("fs") //remove?
// const path = require('path')
// databases
// const myFunc = require('/js/pending-docs')
const express = require('express')
const router = express.Router()
const {pub} = require("public/js/pending-docs")
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');


const doc = docsDB.find({selector:{
    _id:{
        "$gt":null
    }
}})

// router.get('/',async(req,res)=>{
//     const user = req.session.user;
//     const admin = req.session.admin;
//     const approver = req.session.approver;
// })

const func = async function removeRow() {
    for(let i = 0; i<(await doc).docs.length;i++) {
        const d = (await doc).docs[i]._id;
        const fileCreator = (await doc).docs[i].creator;
        const fileName = (await doc).docs[i].name;
        const fileType = (await doc).docs[i].type;
        const fileSize = (await doc).docs[i].size;
        const category = (await doc).docs[i].category;
        const tags_history = (await doc).docs[i].tags_history;
        const version_num = (await doc).docs[i].version_num;
        const state_history = (await doc).docs[i].state_history;
        const min_approvers = (await doc).docs[i].min_approvers;
        const dept = (await doc).docs[i].department; //to be added
        const last_activity = (await doc).docs[i].last_activity; //not sure if kasama pa
        let status = (await doc).docs[i].status;
        const rev = (await doc).docs[i]._rev;
        let clicked = false;
        const numberOfButtons = document.querySelectorAll("button.accept");
        for (let i = 0; i < numberOfButtons; i++) {
            numberOfButtons[i].addEventListener("click", function () {
                clicked = true;
            });
            alert("clicked")
        }
        if (clicked === true) {
            console.log("clicked")
            for (let i = 0; i < numberOfButtons; i++) {
                document.getElementsByTagName("tr")[i].remove();
                window.location = '/dashboard/accepted-documents'
                //TODO: to test
                // if (admin === true || approver === true) {
                // console.log("status for accepted", accepted);
                status = "Accepted";
                await docsDB.insert({
                    name: fileName,
                    type: fileType,
                    size: fileSize,
                    category: category,
                    tags_history: tags_history,
                    version_num: version_num, //finally updates
                    state_history: state_history,
                    creator: fileCreator,
                    min_approvers: min_approvers,
                    department: dept,
                    _rev: rev,
                    // last_activity: "Upload", //TODO: if kaya (not prio)
                    status: status,
                }, d, function (err) {
                    if (!err) {
                        console.log("success status update")
                    } else {
                        console.log(err)
                    }
                })
            }
        } else {
            console.log('not clicked');
        }
    }
    //append in accepted page table
    document.getElementsByTagName("tr")[i].append();
}
module.exports.func = func;