// i think we should insert the code here in front end part
// 'use strict';
//
// const { Contract } = require('fabric-contract-api');
//
// class MyUploadContract extends Contract {
//     //function to check if the assetID exists
//     //docID
//     async myDocExists(ctx, MyDocId) {
//         const buffer = await ctx.stub.getState(MyDocId);
//         return (!!buffer && buffer.length > 0);
//     }
//     //uploadDoc
//     //metadata from couchdb
//     async createDoc(ctx, MyDocId, value) {
//         //checks if assetID exists
//         const exists = await this.myDocExists(ctx, MyDocId);
//         if (exists) {
//             throw new Error(`The my document ${MyDocId} already exists`);
//         }
//         const document = { value };
//         //if it doesn't exists, create new assetID
//         const buffer = Buffer.from(JSON.stringify(document));
//         await ctx.stub.putState(MyDocId, buffer);
//     }
//
// }
//
// module.exports = MyFiLedgerContract;

'use strict';

const { Contract } = require('fabric-contract-api');

const express = require('express')
const router = express.Router()
const fs = require("fs") //remove?
const path = require('path')

// databases
// const nano = require('nano')('http://couchdb:couchdb@127.0.0.1:5984/');
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
//const nano = require('nano')('http://admin:mysecretpassword@127.0.0.1:5984/');
// const nano = require('nano')('http://admin:pw123@127.0.0.1:5984/');
// const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const docsDB = nano.db.use('users');
// const docsDB = nano.db.use('testesdb');
const docViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented


router.get('/', function (req, res){

    console.log(req.body.username)
    console.log(req.body.email)
    res.render("dashboard", {username : req.session.username}); //after session, username
})

router.get("/accepted-docs",(req,res)=>{
    res.render("accepted-docs",{username : req.session.username})
})
router.get("/rejected-docs",(req,res)=>{
    res.render("rejected-docs",{username : req.session.username})
})
router.get("/pending-docs",(req,res)=>{
    res.render("pending-docs",{username : req.session.username})
})

//======================================== UPLOAD FILE-RELATED CODES ================================================================
const multer  = require('multer')
const {MyUploadContract} = require("../index");
//todo maybe prevent zip file upload?
//Specs: 1 file per upload, 1gb, any filetype
var storage = multer.diskStorage({
    destination:'uploads/',
    filename: (req,file,cb)=>{
        cb(null,file.originalname)
    },
    limits:{
        fileSize: 1073741824
    }
})
const upload = multer({
    // dest: 'uploads/', //todo change destination? or delete afterwards
    // limits:{ //no limit on filetype as specified on paper
    //     fileSize: 1073741824, //1gb?
    // },

    storage:storage
})

//todo: change path?; plus redirection to current page; plus popup (#?)
// popup to confirm certain info e.g. the
//I FIX THIS WHEN OUR UI MASTER IS FINALLY HERE
router.post('/upload',  upload.single('uploadDoc'),
    async function (req, res, next){
        //todo necessary user info here esp.: privilege (if !fileCreator/admin) ; they should have no upload button
        // - category, size, type, name,
        // - tags(array), state (always DRAFT state here), path (not sure),
        // - state_change_timestamp (always set right after first upload)
        // - auto-append ver control? if the file already exists
        // -
        // WHEN DONE: REMOVE "for testing purposes"
        //console.log(req.file.destination) //path field but not needed?


        // console.log("ahjiru") //testing purposes
        // console.log(req.file) //testing purposes

        //init all necessary fields :
        const currentTime = new Date();
        const fileName = req.file.originalname;
        const fileType = path.extname(req.file.originalname); //extension; including dot
        const fileSize = await formatBytes(req.file.size);
        const fileTimestamp = currentTime.getMonth() + "/" + currentTime.getDay()+ "/" + currentTime.getFullYear() // e.g. 04/21/2000 21:32:11
            + " " + currentTime.getHours()+ ":" + currentTime.getMinutes()+ ":" + currentTime.getSeconds();
        const filePath = req.file.path; //path but not needed i think

        //TODO! check if filename exists already; add version where `state` = RESUBMITTED; else if new version and state: DRAFT
        //TODO! idk how to universally fix these states to other codes; maybe OOP stuff
        // WHEN IMPLEMENTED: add stateChangeTimestamp
        //for now assumes DRAFT state
        let fileVersion = 1.0; //TODO when findDuplicate() for doc is implemented (auto increment INTEGER if duplicate)
        const fileMinApprovers = 1; //TODO when UI for this is implemented
        const state = "Draft"; //TODO when UI is implemented
        const stateTimestamp = state + " @ " + fileTimestamp ; // @ to separate values later
        const fileCreator = "Erin Cordero"; //TODO implement once sessions
        let fileTagsList = []
        let stateTimestampList = []
        let fileTags = `${fileName}|${req.body.tags.substring(0,req.body.tags.length-1)}|@ ${fileTimestamp} V${parseFloat(fileVersion).toFixed(2)}`
        fileTagsList.push(fileTags)
        stateTimestampList.push(stateTimestamp)
        //generating docId
        let uuid = await nano.uuids(1);
        let id = uuid.uuids[0];
        //updateVersion variables
        const findRev = await docQuery(fileName, fileCreator);
        const revi = findRev[0]._rev;
        const doc = findRev[0]._id;
        let fileVer = findRev[0].version_num;
        let tags = findRev[0].tags_history
        let stateTimestamps = findRev[0].state_history

        //created another index for querying if there is an existing file
        const indexDef = { //copied cod lol
            index: { fields: ["name", "creator"]},
            type: "json",
            name: "doc-rev-index"
        }
        const index = await docsDB.createIndex(indexDef);

        const q = {
            selector: {
                "name": fileName,
                "creator": fileCreator
            }
        };
        const rev = await docsDB.find(q);
        //testing purposes
        console.log(rev.docs)
        console.log(rev)

        //finally worked lol but di pa natry for attachments maybe tom
        // if(rev.docs == ''){
            // console.log('inserting')
            // let uuid = await nano.uuids(1);
            // let id = uuid.uuids[0];
        //     await docsDB.insert({
        //         name: fileName,
        //         type: fileType,
        //         size: fileSize,
        //         category: "standard",
        //         tags_history: fileTagsList,
        //         version_num: fileVersion,
        //         state_history: stateTimestampList,
        //         creator: fileCreator,
        //         min_approvers: fileMinApprovers,
        //         last_activity:"Upload",
        //         status:"Pending",
        //     }, id)
        // }else{
        //     console.log("updating")
        //     // const findRev = await docQuery(fileName, fileCreator);
        //     // const revi = findRev[0]._rev;
        //     // const doc = findRev[0]._id;
        //     // let fileVer = findRev[0].version_num;
        //     // let tags = findRev[0].tags_history
        //     // let stateTimestamps = findRev[0].state_history
        //     if(fileTags.split("|")[1] == ""){
        //         fileVer++;
        //         fileTags = `${fileName}|${tags[tags.length-1].split("|")[1]}|@ ${currentTime} V${parseFloat(fileVer).toFixed(2)}`
        //     }else if(fileTags.split("|")[1] == tags[tags.length-1].split("|")[1]){
        //         fileVer++;
        //         fileTags = `${fileName}|${tags[tags.length-1].split("|")[1]}|@ ${currentTime} V${parseFloat(fileVer).toFixed(2)}`
        //     }else if(fileTags.split("|")[1] != tags[tags.length-1].split("|")[1]){
        //         fileVer+=0.1;
        //         fileTags = `${fileName}|${req.body.tags.substring(0,req.body.tags.length-1)}|@ ${currentTime} V${parseFloat(fileVer).toFixed(2)}`
        //     }
        //     tags.push(fileTags)
        //     stateTimestamps.push(stateTimestamp)
        //     await docsDB.insert({
        //             name: fileName,
        //             type: fileType,
        //             size: fileSize,
        //             category: "standard",
        //             tags_history: tags,
        //             version_num: parseFloat(fileVer).toFixed(2), //finally updates
        //             state_history: stateTimestamps,
        //             creator: fileCreator,
        //             min_approvers: fileMinApprovers,
        //             _rev: revi,
        //             last_activity:"Upload",
        //             status:"Pending",
        //         },doc,
        //         function (err, response){
        //             if(!err){
        //                 console.log("it worked")
        //                 res.redirect("/dashboard?fail=false")
        //             }else {
        //                 console.log("failed")
        //                 res.redirect("/dashboard/?fail=true")
        //             }
        //         }
        //     )
        // }

        //Smart Contract for upload
        class MyUploadContract extends Contract {
        //function to check if the assetID exists
        //docID
        async myDocExists(ctx, id) {
            const buffer = await ctx.stub.getState(id);
            return (!!buffer && buffer.length > 0);
        }

        async updateDocs(ctx, id, fileName, fileType, fileSize, fileTagsList,
                        fileVersion, fileCreator, fileMinApprovers, stateTimestamps, tags, revi) {
            // const exists = await this.myDocExists(ctx, id);
            // if (!exists) {
            //     throw new Error(`The my document ${MyDocId} does not exist`);
            // }
            console.log("updating")
            if(fileTags.split("|")[1] == ""){
                fileVer++;
                fileTags = `${fileName}|${tags[tags.length-1].split("|")[1]}|@ ${currentTime} V${parseFloat(fileVer).toFixed(2)}`
            }else if(fileTags.split("|")[1] == tags[tags.length-1].split("|")[1]){
                fileVer++;
                fileTags = `${fileName}|${tags[tags.length-1].split("|")[1]}|@ ${currentTime} V${parseFloat(fileVer).toFixed(2)}`
            }else if(fileTags.split("|")[1] != tags[tags.length-1].split("|")[1]){
                fileVer+=0.1;
                fileTags = `${fileName}|${req.body.tags.substring(0,req.body.tags.length-1)}|@ ${currentTime} V${parseFloat(fileVer).toFixed(2)}`
            }
            tags.push(fileTags)
            stateTimestamps.push(stateTimestamp)

            const document = {
                name: fileName,
                type: fileType,
                size: fileSize,
                category: "standard",
                tags_history: tags,
                version_num: parseFloat(fileVer).toFixed(2), //finally updates
                state_history: stateTimestamps,
                creator: fileCreator,
                min_approvers: fileMinApprovers,
                _rev: revi,
                last_activity:"Upload",
                status:"Pending",
            };
            const buffer = Buffer.from(JSON.stringify(document));
            const worked = await ctx.stub.putState(id, buffer);
            if(worked){
                console.log("it worked");
                res.redirect("/dashboard?fail=false");
            }else {
                console.log("failed");
                res.redirect("/dashboard/?fail=true")
            }
        }
        //uploadDoc
        //metadata from couchdb
        async createDocs(ctx, id, fileName, fileType, fileSize, fileTagsList,
                        fileVersion, stateTimestampList, fileCreator, fileMinApprovers) {

            //checks if assetID exists
            const exists = await this.myDocExists(ctx, id);
            if (exists) {
                //update the version instead of throwing error
                this.updateDoc(ctx, id, fileName, fileType, fileSize, fileTagsList,
                    fileVersion, fileCreator, fileMinApprovers, stateTimestamps, tags, revi)
                // throw new Error(`The my document ${id} already exists`);
            }
            console.log('inserting')
            const document = {
                name: fileName,
                type: fileType,
                size: fileSize,
                category: "standard",
                tag_history: fileTagsList,
                version_num: fileVersion,
                state_history: stateTimestampList,
                owner: fileCreator,
                min_approvers: fileMinApprovers,
                last_activity: "Upload",
                status: "Pending",
            };
            //if it doesn't exists, create new assetID
            const buffer = Buffer.from(JSON.stringify(document));
            await ctx.stub.putState(id, buffer);
        }



    }

    module.exports = MyUploadContract;

})



//======================================== MIDDLEWARES ================================================================
//QUERY MIDDLEWARE?
async function docQuery(fileName, creator){
    const indexDef = { //copied cod lol
        index: { fields: ["name", "creator"]},
        type: "json",
        name: "doc-rev-index"
    }
    const index = await docsDB.createIndex(indexDef);

    const q = {
        selector: {
            "name": fileName,
            "creator": creator
        }
    };
    const rev = await docsDB.find(q);
    return rev.docs;
}


//======================================== EXTRA FUNCS ================================================================

//src: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
async function formatBytes(bytes, decimals = 2) { //dno if need to async
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}



//======================================== X CODES ================================================================
//======================================== X CODES ================================================================

module.exports = router;


/**
 *
 *
 */