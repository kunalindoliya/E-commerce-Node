const Product=require('../models/product');
const Cart=require('../models/cart');
exports.getProducts=(req,res,next) => {
    Product.fetchAll((products)=>{
        res.render("shop/product-list",{prods:products, path:'/products',pageTitle:'All Products'});
    });
};
exports.getProduct=(req,res,next)=> {
  const id=req.params.id;
  Product.findById(id,product =>{
     res.render('shop/product-detail',{product:product,pageTitle:'Product Detail',path:'/products'})
  });
};
exports.getIndex=(req,res,next) =>{
    Product.fetchAll((products)=>{
        res.render("shop/index",{prods:products, path:'/',pageTitle:'Shop'});
    });
};
exports.getCart=(req,res,next) =>{
 res.render('shop/cart',{path:'/cart',pageTitle:'Your Cart'});
};

exports.postCart=(req,res,next)=> {
    const  id=req.body.id;
    Product.findById(id,product =>{
        Cart.addProduct(id,product.price);
    });
    res.redirect('/cart');
};

exports.getOrders=(req,res,next)=>{
  res.render('shop/orders',{path:'/orders',pageTitle:'Orders'});
};
exports.getCheckout=(req,res,next)=>{
  res.render('/checkout',{path:'/checkout'});
};