const Product = require('../models/product');
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {pageTitle: 'Add Product', path: '/admin/addproduct',editing:false});
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(null,title, imageUrl, description, price);
    product.save();
    res.redirect("/");
};

exports.getEditProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findById(id, product => {
        if(!product)
            return res.redirect('/');
        res.render('admin/edit-product', {pageTitle: 'Edit Product', path: '/admin/editproduct',editing:true,product:product});
    });
};

exports.postEditProduct=(req,res,next)=>{
    const id=req.body.id;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const updatedProduct = new Product(id,title, imageUrl, description, price);
    updatedProduct.save();
    res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("admin/product-list", {prods: products, path: '/admin/products', pageTitle: 'All Products'});
    });
};

exports.deleteProduct=(req,res,next)=> {
  const id=req.params.id;
  Product.deleteProduct(id);
  res.redirect('/admin/products');
};