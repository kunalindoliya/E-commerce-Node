const express=require('express');
const router=express.Router();
const path=require('path');
const rootDir=require('../util/path');

router.get('/addproduct',(req,res,next) => {
    res.sendFile(path.join(rootDir,'views','add-product.html'));
});

router.post('/addproduct',(req,res,next) =>{
    console.log(req.body);
    res.redirect("/");
});
module.exports=router;