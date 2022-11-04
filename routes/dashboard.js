const express = require('express')
const router = express.Router()
const fs = require("fs") //remove?
// const path = require('path')
// databases
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
const nano = require('nano')('http://root:root@127.0.0.1:5984/');
const docsDB = nano.db.use('documents');
const userDB = nano.db.use('users');
const docViews = "/_design/all_users/_view/all";
const departments = ["Sales","Marketing", "Human Resources", "Accounting"] //to remove when dynamic addition. of dept.s implemented


router.get('/', function (req, res){

    console.log(req.body.username)
    console.log(req.body.email)
    res.render("dashboard", {username : req.session.username}); //after session, username
})

// router.get("/accepted-docs",(req,res)=>{
//     res.render("accepted-docs",{username : req.session.username})
// })
router.get("/rejected-docs",(req,res)=>{
    res.render("rejected-docs",{username : req.session.username})
})

router.get("/pending-docs/:page",async(req,res)=>{
    //query for fetching all docs in documents DB
    const docz = await docsDB.find({selector:{
            _id:{
                "$gt":null
            },
            status:"Pending"
        }})
    if(Number(req.params.page) > (Math.ceil(docz.docs.length/10))){
        res.redirect(`1`)
    }
    const accepted = req.body.accept;
    const user = req.session.user;
    const admin = req.session.admin;
    const approver = req.session.approver;

    //query for updating the status in each json doc
    const state = await docsDB.find({selector:{
        _id:{
            "$gt":null
        },
        "status": req.params.status,
        "name": req.params.name
        // "department":
    }})
    res.render("pending-docs", {d: docz, username: req.session.username,page:req.params.page})
})
router.get('/pending-docs',(req,res)=>{
    res.redirect('pending-docs/1')
})

router.get('/accepted-docs',(req,res)=>{
    res.render('accepted-docs',{username:req.session.username})
})

//======================================== UPLOAD FILE-RELATED CODES ================================================================
const multer  = require('multer')
const invoke = require("../network/chaincode/javascript/invoke");
const {originalMaxAge} = require("express-session/session/cookie");
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
var memStorage = multer.memoryStorage()
const upload = multer({
    storage:memStorage
})

//todo: change path?; plus redirection to current page; plus popup (#?)
// popup to confirm certain info e.g. the
//I FIX THIS WHEN OUR UI MASTER IS FINALLY HERE
router.post('/upload',  upload.single('uploadDoc'),
    async function (req, res, next) {
        //todo necessary user info here esp.: privilege (if !fileCreator/admin) ; they should have no upload button
        // - category, size, type, name,
        // - tags(array), state (always DRAFT state here), path (not sure),
        // - state_change_timestamp (always set right after first upload)
        // - auto-append ver control? if the file already exists
        // WHEN DONE: REMOVE "for testing purposes"

        //init all necessary fields :
        const currentTime = new Date(Date.now());
        const fileName = req.file.originalname;
        if (req.file.originalname === null) {
            res.render('dashboard');
        }
        const fileType = path.extname(req.file.originalname); //extension; including dot
        const fileSize = await formatBytes(req.file.size);
        const fileTimestamp = currentTime.getMonth() + 1 + "/" + currentTime.getDate() + "/" + currentTime.getFullYear() // e.g. 04/21/2000 21:32:11
            + " " + currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds();
        const filePath = req.file.path; //path but not needed i think
        console.log("now", fileTimestamp)
        let user = req.session.username
        if (req.session.admin === true) {
            user = 'enroll'
            console.log('ADMIN DITO STAN NCT POTA')
        }
        //TODO! check if filename exists already; add version where `state` = RESUBMITTED; else if new version and state: DRAFT
        //for now assumes DRAFT state
        let fileVersion = 1.0; //TODO when findDuplicate() for doc is implemented (auto increment INTEGER if duplicate)
        const fileMinApprovers = 1; //TODO when UI for this is implemented
        const state = "Draft"; //TODO when UI is implemented
        const stateTimestamp = state + " @ " + fileTimestamp; // @ to separate values later
        // const qName = await userDB.find({selector:{"username":req.session.username}})
        // const fileCreator = `${await qName.docs[0].firstname} ${await qName.docs[0].lastname}`; //TODO implement once sessions
        const fileCreator = `${req.session.firstname} ${req.session.lastname}`;
        let fileTagsList = []
        let stateTimestampList = []
        let fileTags = `${fileName}|${req.body.tags.substring(0, req.body.tags.length - 1)}|@ ${fileTimestamp} V${parseFloat(fileVersion).toFixed(2)}`
        fileTagsList.push(fileTags)
        stateTimestampList.push(stateTimestamp)

        //created another index for querying if there is an existing file
        const indexDef = { //copied cod lol
            index: {fields: ["name", "creator"]},
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

        if (rev.docs == '') {
            console.log('inserting')
            let uuid = await nano.uuids(1);
            let id = uuid.uuids[0];
            var tempPath = path.resolve(__dirname, `./../uploads/${fileName}`);
            fs.writeFileSync(path.resolve(__dirname, `./../uploads/${fileName}`), req.file.buffer)
            await docsDB.insert({
                name: fileName,
                type: fileType,
                size: fileSize,
                category: "standard",
                tags_history: fileTagsList,
                version_num: fileVersion,
                state_history: stateTimestampList,
                creator: fileCreator,
                min_approvers: fileMinApprovers,
                last_activity: "Upload",
                status: "Pending",
            }, id, function (err, response) {
                if (!err) {
                    var docdeets = {
                        name: fileName,
                        type: fileType,
                        size: fileSize,
                        category: "standard",
                        tags_history: fileTagsList,
                        version_num: fileVersion,
                        state_history: stateTimestampList,
                        creator: fileCreator,
                        min_approvers: fileMinApprovers,
                        last_activity: "Upload",
                        status: "Pending",
                    }

                    invoke.invokeTransaction(user, req.session.admin, id, docdeets.name, docdeets.type,
                        docdeets.size, docdeets.tags_history, docdeets.version_num, docdeets.state_history,
                        docdeets.creator, docdeets.min_approvers);

                    console.log("it worked")
                    console.log('File Deets:', fileName, req.file.mimetype)
                    res.redirect("/dashboard?fail=false")
                } else {
                    console.log("failed: ", err)
                    res.redirect("/dashboard/?fail=true")
                }

            })
            const frev = await docQuery(fileName, fileCreator);
            const rev = frev[0]._rev;
            fs.readFile(tempPath, async (err, data) => { //dno if async
                await docsDB.attachment.insert(
                    id,
                    fileName,
                    data,
                    req.file.mimetype,
                    {rev: rev}
                )
                {
                    if (err){
                        console.log('Fail attach: ', err)
                    }
                    console.log('no err')
                }
            });
        } else { //TODO ======================================= UPDATING =================================================
            //TODO: CHANGE CC FUNCTION TO UPDATEDOCS INSTEAD
            console.log("updating")
            const findRev = await docQuery(fileName, fileCreator);
            const revi = findRev[0]._rev;
            const doc = findRev[0]._id;
            let fileVer = findRev[0].version_num;
            let tags = findRev[0].tags_history;
            let stateTimestamps = findRev[0].state_history;
            var file = fs.readFileSync(path.resolve(__dirname, `./../uploads/${fileName}`));
            var tempPath = path.resolve(__dirname, `./../uploads/${fileName}`);
            console.log(file) //todo remove
            checkFileChanges(req.file.buffer, req.body.tags, file);
            fs.writeFileSync(path.resolve(__dirname, `./../uploads/${fileName}`), req.file.buffer);
            tags.push(fileTags);
            stateTimestamps.push(stateTimestamp);
            await docsDB.insert({
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
                    last_activity: "Upload",
                    status: "Pending",
                }, doc,
                function (err, response) {
                    if (!err) { //todo dana idk if mappush literal file sa ledger, hopefully hndi
                        var docdeets = {
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
                            last_activity: "Upload",
                            status: "Pending",
                        }
                        console.log('File Deets:', fileName, req.file.mimetype, tempPath)
                        console.log("it worked")
                        invoke.updateTransaction(user, req.session.admin, doc, docdeets.name, docdeets.type, docdeets.size,
                            docdeets.tags_history, docdeets.version_num, docdeets.creator,
                            docdeets.min_approvers, docdeets.state_history);

                        res.redirect("/dashboard?fail=false")
                    } else {
                        console.log("failed", err)
                        res.redirect("/dashboard/?fail=true")
                    }
                }
            )
            const frev = await docQuery(fileName, fileCreator);
            const rev = frev[0]._rev;
            fs.readFile(tempPath, async (err, data) => { //dno if async
                await docsDB.attachment.insert(
                    doc,
                    fileName,
                    data,
                    req.file.mimetype,
                    {rev: rev}
                )
                {
                    if (err){
                        console.log('Fail attach: ', err)
                    }
                    console.log('no err')
                }
            });

        }
    })



//======================================== MIDDLEWARES ================================================================
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

async function checkFileChanges(filebuff, filetag, file){
    if (!file.equals(filebuff)) { //checking if same file
        if (fileTags.split("|")[1] == "") {
            fileVer++;
            fileTags = `${fileName}|${tags[tags.length - 1].split("|")[1]}|@ ${fileTimestamp} V${parseFloat(fileVer).toFixed(2)}`
        } else if (fileTags.split("|")[1] == tags[tags.length - 1].split("|")[1]) {
            fileVer++;
            fileTags = `${fileName}|${tags[tags.length - 1].split("|")[1]}|@ ${fileTimestamp} V${parseFloat(fileVer).toFixed(2)}`
        } else if (fileTags.split("|")[1] != tags[tags.length - 1].split("|")[1]) {
            fileVer += 0.1;
            fileTags = `${fileName}|${filetag.substring(0, req.body.tags.length - 1)}|@ ${fileTimestamp} V${parseFloat(fileVer).toFixed(2)}`
        }
    }
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

module.exports = router;

