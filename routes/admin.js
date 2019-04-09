const express=require('express');
const router=express.Router();
const path=require('path');
const rootDir=require('../util/path');
const products=[];

router.get('/addproduct',(req,res,next) => {
    res.render('add-product',{pageTitle:'Add Product',path:'/admin/addproduct'});
});

router.post('/addproduct',(req,res,next) =>{
    products.push({'title':req.body.title});
    res.redirect("/");
});
exports.routes=router;
exports.products=products;