const express = require('express');
const bodyParser = require('body-parser');
const { generateFromEmail } = require("unique-username-generator");
const generator = require('generate-password');
const app = express();
//todo comment out later:
const nano = require('nano')('http://administrator:qF3ChYhp@127.0.0.1:5984/');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.set('view engine', 'ejs');

const departments = ["Sales","Marketing", "Human Resources", "Accounting"]

//todo someone commented out to make it work; remove befoer push
const dbList = nano.db.list();
// show list of databases
dbList.then(function (dbs){
    console.log(dbs)
})
// databases
const userDB = nano.db.use('users');
const userViews = "/_design/all_users/_view/all";
//end comment out


app.get('/create-docs', function (req, res){
    res.render("create-docs");
})

app.get('/header', function (req, res){
    res.render("header");
})

app.get('/', function (req, res){
    res.render("index");
})


app.listen(process.env.PORT || 3000, function (){
    console.log("Server started on port 3000")
})

// Init all routers
const loginRouter = require("./routes/login")
const regRouter = require("./routes/registration")
const dashboardRouter = require("./routes/dashboard")
const documentsRouter = require("./routes/documents")
const allDocumentsRouter = require("./routes/all-documents")
const adminRouter = require("./routes/administration")
//Mount all routers
app.use('/login', loginRouter)
app.use('/registration', regRouter)
app.use('/dashboard', dashboardRouter)
app.use('/documents', documentsRouter)
app.use('/all-documents', allDocumentsRouter)
app.use('/administration', adminRouter);



