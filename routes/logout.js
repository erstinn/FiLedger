const express = require('express')
const router = express.Router()
const session = require('express-session')

router.use(session({
    secret: 'secretkeytest',
    saveUninitialized: false,
    cookie: {maxAge: 3600000}, //one hour maxAge, not sure abt this one
    resave: false
}))

router.get('/', function(req, res){
    req.session.destroy();
    console.log('logout success')
    res.redirect('/')
}) //DITO MUNA FOR NOW, WILL BE MOVING TO SEPARATE FILE SOON

module.exports = router