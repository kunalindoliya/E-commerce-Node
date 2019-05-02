const express=require('express');
const router=express.Router();
const path=require('path');
const shopController=require('../controllers/shop');
const isAuth=require('../middleware/is-auth');
router.get('/',shopController.getIndex);
router.get('/products',shopController.getProducts);
router.get('/product-detail/:id',shopController.getProduct);
router.get('/cart',isAuth,shopController.getCart);
router.post('/cart',isAuth,shopController.postCart);
router.post('/cart-delete-item',isAuth,shopController.postCartDeleteItem);
router.get('/orders',isAuth,shopController.getOrders);
router.post('/create-order',isAuth,shopController.postOrder);
router.get('/orders/:orderId',isAuth,shopController.getInvoice);
router.get('/checkout',isAuth,shopController.getCheckout);

module.exports=router;