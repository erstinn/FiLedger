const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');
// const dbList = nano.db.list();
//
//
// dbList.then(function (dbs){
//     console.log(dbs)
// })

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.set('view engine', 'ejs');

const departments = ["Sales","Marketing", "Human Resources", "Accounting"]

app.get('/login', function (req, res){
    res.render("login");
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

app.post("/registration", (req, res)=>{
    const un = req.body.username;
    const lname = req.body.lastname;
    const fname = req.body.firstname;
    const email = req.body.email;
    const password = req.body.password;
    const admin = req.body.isAdmin;
    const add_doc = req.body.add_doc;
    const dept = req.body.dept; //this works now
    console.log(dept, lname, fname, email, password, un, admin, add_doc);

})

app.get('/administration/admin',function (req,res){
    res.render("admin");
})

app.get('/management/manage-documents/approver',function (req,res){
    res.render("manageDocuments");
})

app.get('/user-page',(req,res)=>{
    res.render("user-page")
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

