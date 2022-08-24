const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.set('view engine', 'ejs');

app.get('/login', function (req, res){
    res.render("login");
})


app.get('/dashboard', function (req, res){
    res.render("dashboard");
})


app.get('/', function (req, res){
    res.render("index");
})


app.get('/registration', function (req, res){
    res.render("registration");
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



app.listen(process.env.PORT||80, function (){
    console.log("Server started on port 3000")
})

