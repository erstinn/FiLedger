const express = require('express')
const router = express.Router()

router.get('/', function (req, res){
    res.render("dashboard");
})

router.get("/accepted-docs",(req,res)=>{
    res.render("accepted-docs")
})
router.get("/rejected-docs",(req,res)=>{
    res.render("rejected-docs")
})
router.get("/pending-docs",(req,res)=>{
    res.render("pending-docs")
})

module.exports = router