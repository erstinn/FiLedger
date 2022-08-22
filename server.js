<<<<<<< HEAD
const express = require('express');
const bodyParser = require('body-parser');
const nano = require('nano')('http://administrator:qF3ChYhp@localhost:5984');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.set('view engine', 'ejs');

const dbList = nano.db.list();

//show list of databases
dbList.then(function (dbs){
    console.log(dbs);
});


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
    res.render("registration");
})

app.get('/management/manage-people/admin',function (req,res){
    res.render("managePeople");
})

app.get('/management/manage-documents/approver',function (req,res){
    res.render("manageDocuments");
})


app.listen(process.env.PORT || 3000, function (){
    console.log("Server started on port 3000")
})

=======
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.set('view engine', 'ejs');


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

app.get('/index', function (req, res){
    res.render("index");
})

app.get('/manage', function (req, res){
    res.render("manage");
})

app.get('/management', function (req, res){
    res.render("management");
})

app.get('/registration', function (req, res){
    res.render("registration");
})


app.listen(process.env.PORT || 3000, function (){
    console.log("Server started on port 3000")
})

>>>>>>> 707a8303485e3d920aa10404be1be60dd5d53d2b
