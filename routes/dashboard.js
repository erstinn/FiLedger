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


router.get('/', function (req, res){

    console.log(req.body.username)
    console.log(req.body.email)
    res.render("dashboard", {username : req.session.username}); //after session, username
})

// router.get("/accepted-docs",(req,res)=>{
//     res.render("accepted-docs",{username : req.session.username})
// })
router.get("/rejected-docs/:page",async(req,res)=>{
    let docz = await docsOrg1DB.find({selector:{
        _id:{
            "$gt":null
        },
        status:"Rejected"
    }})
    if(Number(req.params.page) <= (Math.ceil(docz.docs.length/10))){
        if(req.query.sort == "title"){
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        else if(req.query.sort == 'type'){
            docz.docs = docz.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
        }
        else if(req.query.sort == "size"){
            docz.docs = docz.docs.sort((a,b)=>{
                let unitA = a.size.split(" ")[1]
                let unitB = b.size.split(" ")[1]
                let valueA;
                let valueB;
                if(unitA == 'GB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125000
                }
                else if(unitA == 'MB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125
                }
                else if(unitA == 'KB'){
                    valueA = parseFloat(a.size.split(' ')[0])
                }

                if(unitB == 'GB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125000
                }
                else if(unitB == 'MB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125
                }
                else if(unitB == 'KB'){
                    valueB = parseFloat(b.size.split(' ')[0])
                }
                if(valueA > valueB){
                    return 1
                }
                else{
                    return -1
                }
            })
        }else if(req.query.sort == "author"){
            docz.docs = docz.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
        }else if(req.query.sort == 'date'){
            docz.docs = docz.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
        }
        else{
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        res.render('rejected-docs',{username:req.session.username,d:docz,page:req.params.page})
    }
    else{
        res.redirect("1")
    }
})

router.get("/pending-docs/:page",async(req,res)=>{
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

        if(req.query.sort == "title"){
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        else if(req.query.sort == 'type'){
            docz.docs = docz.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
        }
        else if(req.query.sort == "size"){
            docz.docs = docz.docs.sort((a,b)=>{
                let unitA = a.size.split(" ")[1]
                let unitB = b.size.split(" ")[1]
                let valueA;
                let valueB;
                if(unitA == 'GB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125000
                }
                else if(unitA == 'MB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125
                }
                else if(unitA == 'KB'){
                    valueA = parseFloat(a.size.split(' ')[0])
                }

                if(unitB == 'GB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125000
                }
                else if(unitB == 'MB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125
                }
                else if(unitB == 'KB'){
                    valueB = parseFloat(b.size.split(' ')[0])
                }
                if(valueA > valueB){
                    return 1
                }
                else{
                    return -1
                }
            })
        }else if(req.query.sort == "author"){
            docz.docs = docz.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
        }else if(req.query.sort == 'date'){
            docz.docs = docz.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
        }
        else{
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        res.render("pending-docs", {d: docz, username: req.session.username,page:req.params.page})
    }else{
        res.redirect('1')
    }
    const accepted = req.body.accept;
    // const user = req.session.user;
    const admin = req.session.admin;
    const approver = req.session.approver;

    //query for updating the status in each json doc
    // const state = await docsOrg1DB.find({selector:{
})
router.get('/pending-docs',(req,res)=>{
    res.redirect('pending-docs/1')
})

router.get('/accepted-docs/:page',async(req,res)=>{
    const docz = await docsOrg1DB.find({selector:{
        _id:{
            "$gt":null
        },
        status:"Accepted"
    }})
    if(Number(req.params.page) <= (Math.ceil(docz.docs.length/10))){
        if(req.query.sort == "title"){
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        else if(req.query.sort == 'type'){
            docz.docs = docz.docs.sort((a,b)=>(a.type.slice(1).toUpperCase() > b.type.slice(1).toUpperCase())? 1:-1)
        }
        else if(req.query.sort == "size"){
            docz.docs = docz.docs.sort((a,b)=>{
                let unitA = a.size.split(" ")[1]
                let unitB = b.size.split(" ")[1]
                let valueA;
                let valueB;
                if(unitA == 'GB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125000
                }
                else if(unitA == 'MB'){
                    valueA = parseFloat(a.size.split(' ')[0]) * 125
                }
                else if(unitA == 'KB'){
                    valueA = parseFloat(a.size.split(' ')[0])
                }

                if(unitB == 'GB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125000
                }
                else if(unitB == 'MB'){
                    valueB = parseFloat(b.size.split(' ')[0]) * 125
                }
                else if(unitB == 'KB'){
                    valueB = parseFloat(b.size.split(' ')[0])
                }
                if(valueA > valueB){
                    return 1
                }
                else{
                    return -1
                }
            })
        }else if(req.query.sort == "author"){
            docz.docs = docz.docs.sort((a,b)=>(a.creator > b.creator)? 1:-1)
        }else if(req.query.sort == 'date'){
            docz.docs = docz.docs.sort((a,b)=>(a.state_history.slice(-1) > b.state_history.slice(-1))? 1:-1)
        }
        else{
            docz.docs = docz.docs.sort((a,b)=>(a.name > b.name)? 1:-1)
        }
        res.render('accepted-docs',{username:req.session.username,d:docz,page:req.params.page})
    }
    else{
        res.redirect("1")
    }
})
router.get('/accepted-docs',(req,res)=>{
    res.redirect('accepted-docs/1')
})
router.get('/rejected-docs',(req,res)=>{
    res.redirect('rejected-docs/1')
})

//======================================== UPLOAD FILE-RELATED CODES ================================================================
const multer  = require('multer')
const invoke = require("../network/chaincode/javascript/invoke");
const {originalMaxAge} = require("express-session/session/cookie");
// const e = require('express'); //?
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
        // ADD 'req.file, req.session, req.body,'ORGDB'' AS PARAMS FOR insertDoc

        //init all necessary fields :
        if (req.file.originalname === null) {
            res.render('dashboard');
        }
        //created another index for querying if there is an existing file
        const indexDef = { //copied cod lol
            index: {fields: ["name", "creator"]},
            type: "json",
            name: "doc-rev-index"
        }
        const index = await docsOrg1DB.createIndex(indexDef);

        const fileCreator = `${req.session.firstname} ${req.session.lastname}`;
        const fileName = req.file.originalname;


        const q = {
            selector: {
                "name": fileName,
                "creator": fileCreator
            }
        };
        const rev = await docsOrg1DB.find(q);

        if (rev.docs == '') {
            // TODO: add insertDoc function here
            //  - add if else for checking orgs for DB
            await insertDoc(req.file, req.session, req.body, docsOrg1DB, res);
            //END OF FUNCTION
        } else { //TODO ======================================= UPDATING =================================================
            //TODO: turn into function
            // -Add (req.file, req.session, req.body, 'OrgDB') AS PARAMS FOR updateDoc
            await updateDoc(req.file, req.session, req.body, docsOrg1DB, res);
            //end of func
        }
    })



//======================================== MIDDLEWARES ================================================================
async function docQuery(fileName, creator){
    const indexDef = { //copied cod lol
        index: { fields: ["name", "creator"]},
        type: "json",
        name: "doc-rev-index"
    }
    const index = await docsOrg1DB.createIndex(indexDef);

    const q = {
        selector: {
            "name": fileName,
            "creator": creator
        }
    };
    const rev = await docsOrg1DB.find(q);
    return rev.docs;
}

//TODO: change these into returns so that we can assign it to var nalang
async function checkFileChanges(filebuff, filetag, file, fileVer, fileTimestamp, fileTags){
    var ver = parseInt(fileVer);

    if (!file.equals(filebuff)) { //checking if same file
        if (fileTags.split("|")[1] == "") {
            return{
                version: ver++,
                tags: `${file.originalname}|${filetag[filetag.length - 1].split("|")[1]}|@ ${fileTimestamp} V${parseFloat(fileVer).toFixed(2)}`
            };
        } else if (fileTags.split("|")[1] == filetag[filetag.length - 1].split("|")[1]) {
            return{
                version: ver++,
                tags: `${file.originalname}|${filetag[filetag.length - 1].split("|")[1]}|@ ${fileTimestamp} V${parseFloat(fileVer).toFixed(2)}`
            }
        } else if (fileTags.split("|")[1] != filetag[filetag.length - 1].split("|")[1]) {
            return {
                version: ver += 0.1,
                tags: `${file.originalname}|${filetag.substring(0, filetag.length - 1)}|@ ${fileTimestamp} V${parseFloat(fileVer).toFixed(2)}`

            }
        }
    }
}

async function insertDoc(file, session, body, orgDB, res){
    const currentTime = new Date(Date.now());
    const fileName = file.originalname;

    const fileType = path.extname(file.originalname); //extension; including dot
    console.log(path.extname(file.originalname))
    const fileSize = await formatBytes(file.size);
    const fileTimestamp = currentTime.getMonth() + 1 + "/" + currentTime.getDate() + "/" + currentTime.getFullYear() // e.g. 04/21/2000 21:32:11
        + " " + currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds();
    const filePath = file.path; //path but not needed i think
    console.log("now", fileTimestamp)
    let user = session.username
    if (session.admin === true) {
        user = 'enroll'
        console.log('ADMIN DITO !!! GRRR')
    }
    //TODO! check if filename exists already; add version where `state` = RESUBMITTED; else if new version and state: DRAFT
    //for now assumes DRAFT state
    let fileVersion = 1.0; //TODO when findDuplicate() for doc is implemented (auto increment INTEGER if duplicate)
    const fileMinApprovers = 1; //TODO when UI for this is implemented
    const state = "Draft"; //TODO when UI is implemented
    const stateTimestamp = state + " @ " + fileTimestamp; // @ to separate values later
    // const qName = await userDB.find({selector:{"username":req.session.username}})
    // const fileCreator = `${await qName.docs[0].firstname} ${await qName.docs[0].lastname}`; //TODO implement once sessions
    const fileCreator = `${session.firstname} ${session.lastname}`;
    let fileTagsList = []
    let stateTimestampList = []
    let fileTags = `${fileName}|${body.tags.substring(0, body.tags.length - 1)}|@ ${fileTimestamp} V${parseFloat(fileVersion).toFixed(2)}`
    fileTagsList.push(fileTags)
    stateTimestampList.push(stateTimestamp)

    //created another index for querying if there is an existing file
    const indexDef = { //copied cod lol
        index: {fields: ["name", "creator"]},
        type: "json",
        name: "doc-rev-index"
    }
    const index = await orgDB.createIndex(indexDef);

    const q = {
        selector: {
            "name": fileName,
            "creator": fileCreator
        }
    };
    const rev = await orgDB.find(q);

        // TODO: add insertNewFile function here
        console.log('inserting')
        let uuid = await nano.uuids(1);
        let id = uuid.uuids[0];
        var tempPath = path.resolve(__dirname, `./../uploads/${fileName}`);
        fs.writeFileSync(path.resolve(__dirname, `./../uploads/${fileName}`), file.buffer)
        await orgDB.insert({
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

                invoke.invokeTransaction(user, session.admin, id, docdeets.name, docdeets.type,
                    docdeets.size, docdeets.tags_history, docdeets.version_num, docdeets.state_history,
                    docdeets.creator, docdeets.min_approvers);

                console.log("it worked")
                console.log('File Deets:', fileName, file.mimetype)
                res.redirect("/dashboard?fail=false")
            } else {
                console.log("failed: ", err)
                res.redirect("/dashboard/?fail=true")
            }

        })

        const frev = await docQuery(fileName, fileCreator);
        const revi = frev[0]._rev;
        fs.readFile(tempPath, async (err, data) => { //dno if async
            await orgDB.attachment.insert(
                id,
                fileName,
                data,
                file.mimetype,
                {rev: revi}
            )
            {
                if (err){
                    console.log('Fail attach: ', err)
                }
                console.log('no err')
            }
        }); //END OF FUNCTION
}

// UPDATE FILE FUNCTION
async function updateDoc(file, session, body, orgDB, res){
    console.log("updating")
    const currentTime = new Date(Date.now());
    const fileName = file.originalname;
    const fileCreator = `${session.firstname} ${session.lastname}`;
    const fileMinApprovers = 1; //not sure if when this will be changed, placeholder for now
    const findRev = await docQuery(fileName, fileCreator);
    const revi = findRev[0]._rev;
    const doc = findRev[0]._id;
    let fileVer = findRev[0].version_num;
    let tags = findRev[0].tags_history;
    let stateTimestamps = findRev[0].state_history;
    let user = session.username
    if (session.admin === true) {
        user = 'enroll'
        console.log('ADMIN DITO !!! GRRR')
    }
    //DI Q SURE IF DITO TO OR SA LABAS NALANG PERO DITO MUNA -dana
    const fileTimestamp = currentTime.getMonth() + 1 + "/" + currentTime.getDate() + "/" + currentTime.getFullYear() // e.g. 04/21/2000 21:32:11
        + " " + currentTime.getHours() + ":" + currentTime.getMinutes() + ":" + currentTime.getSeconds();
    const state = "Draft"; //TODO when UI is implemented
    const fileType = path.extname(file.originalname); //extension; including dot
    const fileSize = await formatBytes(file.size);
    const stateTimestamp = state + " @ " + fileTimestamp; // @ to separate values later
    let fileTags = `${fileName}|${body.tags.substring(0, body.tags.length - 1)}|@ ${fileTimestamp} V${parseFloat(fileVer).toFixed(2)}`
    var fileInp = fs.readFileSync(path.resolve(__dirname, `./../uploads/${fileName}`));
    var tempPath = path.resolve(__dirname, `./../uploads/${fileName}`);
    console.log(fileInp) //todo remove
    let newMetadata = checkFileChanges(file.buffer, body.tags, fileInp, fileVer, fileTimestamp, fileTags);
    // let newVer = newMetadata.version; //calls version of newMetadata kaso undefined daw huhu.
    fs.writeFileSync(path.resolve(__dirname, `./../uploads/${fileName}`), file.buffer);
    // tags.push(newMetadata.tags); //TODO: call newMetada.tags
    tags.push(fileTags);
    stateTimestamps.push(stateTimestamp);
    await orgDB.insert({
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
            if (!err) {
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
                console.log('File Deets:', fileName, file.mimetype, tempPath)
                console.log("it worked")
                invoke.updateTransaction(user, session.admin, doc, docdeets.name, docdeets.type, docdeets.size,
                    docdeets.tags_history, docdeets.version_num, docdeets.creator,
                    docdeets.min_approvers, docdeets.state_history);

                res.redirect("/dashboard?fail=false")
            } else {
                console.log("failed dIT0: ", err)
                res.redirect("/dashboard/?fail=true")
            }
        }
    )
    const frev = await docQuery(fileName, fileCreator);
    const rev = frev[0]._rev;
    fs.readFile(tempPath, async (err, data) => { //dno if async
        await orgDB.attachment.insert(
            doc,
            fileName,
            data,
            file.mimetype,
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

