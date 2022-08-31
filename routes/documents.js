const express = require('express')
const router = express.Router()

router.get('/', function (req, res){
    res.render("documents", {username : req.body.username});
})

module.exports = router