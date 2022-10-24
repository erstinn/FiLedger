const express = require('express')
const router = express.Router()



router.get('/admin',function (req,res){
    res.render("admin",{username : req.session.username});
})

module.exports = router