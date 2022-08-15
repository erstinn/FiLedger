const express = require('express');
const bodyParser = require('body-parser');
const NodeCouchDb = require('node-couchdb');

const app = express();

const couch = new NodeCouchDb({
    auth:{
        user: "username",
        password: "temppass1234"
    }
})

const dbname = 'try_users';
const viewURL = '_design/someuser/_view/trial';

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.set('view engine', 'ejs');

couch.listDatabases().then(function (dbs){
    console.log(dbs)
})

app.get('/',function (req,res){
   couch.get(dbname, viewURL).then(
       function(data, headers, status){
           res.render('trial-couch', {
               users:data.data.rows
           });
       },
       function (err){
           res.send(err);
       });
})

app.post('/user/add', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    //generate an id for each user
    couch.uniqid().then(function(ids){
        const id = ids[0];
        //insert the users in db
        couch.insert(dbname, {
            _id: id,
            name: name,
            email: email
        }).then(
            function(data, headers, status){
                res.redirect('/');
            },
            function(err){
                res.send(err);
            });
    });
});

app.post('/user/delete/:id', function(req, res){
    const id = req.params.id;
    const rev = req.body.rev;

    couch.del(dbname, id, rev).then(
        function(data, headers, status){
            res.redirect('/');
        },
        function(err){
            res.send(err)
        });
})

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

