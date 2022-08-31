const express = require('express')
const router = express.Router()
const fs = require("fs") //remove?
const path = require('path')

// databases
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// const docsDB = nano.db.use('documents');
const docsDB = nano.db.use('testesdb');
// const docViews = "/_design/all_users/_view/all";
// const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented


router.get('/', function (req, res){

    console.log(req.body.username)
    console.log(req.body.email)
    res.render("dashboard", {username : req.body.username}); //after session, username
})

router.get("/accepted-docs",(req,res)=>{
    res.render("accepted-docs")
})
router.get("/rejected-docs",(req,res)=>{
    res.render("rejected-docs")
})
router.get("/pending-docs",(req,res)=>{
    res.render("pending-docs")
})

//======================================== UPLOAD FILE-RELATED CODES ================================================================
const multer  = require('multer')
//todo maybe prevent zip file upload?
//Specs: 1 file per upload, 1gb, any filetype
const upload = multer({
    dest: 'uploads/', //todo change destination? or delete afterwards
    limits:{ //no limit on filetype as specified on paper
        fileSize: 1073741824, //1gb?
    },
})



//todo: change path?; plus redirection to current page; plus popup (#?)
// popup to confirm certain info e.g. the
//I FIX THIS WHEN OUR UI MASTER IS FINALLY HERE
router.post('/upload',  upload.single('uploadDoc'),
    async function (req, res, next){
        //todo necessary user info here esp.: privilege (if !creator/admin) ; they should have no upload button
        // - category, size, type, name,
        // - tags(array), state (always DRAFT state here), path (not sure),
        // - state_change_timestamp (always set right after first upload)
        // - auto-append ver control? if the file already exists
        // -
        //console.log(req.file.destination) //path field but not needed?


        let uuid = await nano.uuids(1);
        let id = uuid.uuids[0];

        console.log("ahjiru") //testing purposes
        console.log(req.file) //testing purposes

        //init all necessary fields :
        const currentTime = new Date();
        const fileName = req.file.originalname;
        const fileType = path.extname(req.file.originalname); //extension; including dot
        const fileSize = await formatBytes(req.file.size);
        const timestamp = currentTime.getMonth() + "/" + currentTime.getDay()+ "/" + currentTime.getFullYear() // e.g. 04/21/2000 21:32:11
            + " " + currentTime.getHours()+ ":" + currentTime.getMinutes()+ ":" + currentTime.getSeconds();
        // console.log(req.file.destination); //path but not needed i think
        // res.status(204).send() //dno

        //TODO! check if filename exists already; add version where `state` = RESUBMITTED; else if new version and state: DRAFT
        //TODO! idk how to universally fix these states to other codes; maybe OOP stuff
        // WHEN IMPLEMENTED: add stateChangeTimestamp
        //for now assumes DRAFT state
        const state = "Draft";
        const stateTimestamp = state + " @ " + timestamp ; // @ to separate values later

        await docsDB.insert({
            _id: id,
            name: fileName,
            type: fileType,
            size: fileSize,
            category: "standard",
            tags : [fileName, "random"],
            state_history: [stateTimestamp],
            "creator" : "Erin Cordero"
        })

})



//======================================== MIDDLEWARES ================================================================
//QUERY MIDDLEWARE
async function userQuery(req, res, next){
    //todo uncomment when sessions are implemented
    //const indexDef = { //copied cod lol
    //     index: { fields: ["email", "password", "department"]},
    //     type: "json",
    //     name: "username-index"
    // }
    // const index = await userDB.createIndex(indexDef);
    //
    // const q = {
    //     selector: {
    //         "email": varemail,
    //         "password": passw,
    //         "department": dept
    //     }
    // };
    // const response = await userDB.find(q)
    //
    // next();
}

async function documentsQuery(){
    //TODO! when sessions are implemented; ensure query limited to privilege (Smart Cont?)


}


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

module.exports = router