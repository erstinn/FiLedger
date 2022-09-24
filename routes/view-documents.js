const express = require('express')
const router = express.Router()



router.get('/:id',function (req,res){
    
    res.render("view-documents");
})

module.exports = router