const express = require('express');
const bodyParser = require('body-parser');
const { generateFromEmail } = require("unique-username-generator");
const generator = require('generate-password');
const app = express();
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.set('view engine', 'ejs');

const departments = ["Sales","Marketing", "Human Resources", "Accounting"]

// const dbList = nano.db.list();
//show list of databases
// dbList.then(function (dbs){
//     console.log(dbs)
// })

//databases
// const userDB = nano.db.use('users');
const userViews = "/_design/all_users/_view/all";

app.get('/login', function (req, res){
    res.render("login", {dep: departments});
})

//Gets the data obtained from Login Form
app.post('/login', async function (req, res) {
    const varemail = req.body.email;
    const passw = req.body.password;
    const dept = req.body.dept;
    let logErr = '';

    //created an index since mas advisable ata pag nag-qquery and nawawala yung warning :>
    // not sure if index is used by ill keep it here nalang muna -dana
    const indexDef = {
        index: { fields: ["email", "password", "department"]},
        type: "json",
        name: "trial-index"
    }

    //needed lang para mawala warning but not sure di naman ata super need?
    const index = await userDB.createIndex(indexDef);

    const q = {
        selector: {
            "email": varemail,
            "password": passw,
            "department": dept
        }
    };

    const response = await userDB.find(q)

    //need double equal lang para gumana
    console.log(response)
    if(response.docs == '' || dept === undefined){
        logErr = 'Incorrect Login Credentials. Please try again...';
        //sends login error to login.ejs
        res.render('login', {dep:departments, logErr:logErr})//placeholder
    }else{
        res.redirect('/dashboard')
    }

    console.log(index);
})

app.get('/approval-page', function (req, res){
    res.render("approval-page");
})

app.get('/create-docs', function (req, res){
    res.render("create-docs");
})

app.get('/dashboard', function (req, res){
    res.render("dashboard");
})

app.get('/documents', function (req, res){
    res.render("documents");
})

app.get('/header', function (req, res){
    res.render("header");
})

app.get('/', function (req, res){
    res.render("index");
})

app.get('/manage', function (req, res){
    res.render("manage");
})

app.get('/management', function (req, res){
    res.render("management");
})

app.get('/registration', function (req, res){
    res.render("registration", {dep: departments});
})

app.post("/registration/status", async function (req, res){
    const userName = req.body.username; //generated
    const lastName = req.body.lastname;
    const firstName = req.body.firstname;
    const email = req.body.email;
    const password = req.body.password; //generated
    const admin = req.body.isAdmin;
    const add_doc = req.body.add_doc;
    const dept = req.body.dept; //this works now

    //generate id
    let uuid = await nano.uuids(1);
    let id = uuid.uuids[0];

    //generate username
    const username = generateFromEmail(
        email,
        3
    );

    //generate default password
    const passw = generator.generate({
        length: 10,
        numbers: true
    })

    await userDB.insert({
        _id: id,
        firstname: firstName,
        lastname: lastName,
        email: email,
        username: username,
        password: passw,
        department: dept,
        add_doc: add_doc,
        admin: admin
    })

    if(res.statusCode === 200){
        res.render('success-reg');
    }
    else{
        //not sure if need
        res.render('failure-reg');
    }

    // console.log(dept, lname, fname, email, password, un, admin, add_doc);

})

app.get('/administration/admin',function (req,res){
    res.render("admin");
})

app.get('/management/manage-documents/approver',function (req,res){
    res.render("manageDocuments");
})

app.get('/all-documents',(req,res)=>{
    res.render("all-documents")
})

app.get("/dashboard/accepted-docs",(req,res)=>{
    res.render("accepted-docs")
})
app.get("/dashboard/rejected-docs",(req,res)=>{
    res.render("rejected-docs")
})
app.get("/dashboard/pending-docs",(req,res)=>{
    res.render("pending-docs")
})



app.listen(process.env.PORT || 3000, function (){
    console.log("Server started on port 3000")
})

