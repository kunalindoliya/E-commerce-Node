const express=require('express');
const router=express.Router();
const adminController=require('../controllers/admin');
router.get('/addproduct',adminController.getAddProduct);
router.get('/products',adminController.getProducts);
router.post('/addproduct',adminController.postAddProduct);
module.exports=router;
