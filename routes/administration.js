const express = require('express')
const router = express.Router()



router.get('/admin',function (req,res){
    res.render("admin");
})

module.exports = router