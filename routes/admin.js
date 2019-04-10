const express=require('express');
const router=express.Router();
const productsController=require('../controllers/products');
router.get('/addproduct',productsController.getAddProduct);

router.post('/addproduct',productsController.postAddProduct);
module.exports=router;
