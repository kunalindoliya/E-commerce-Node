const products=[];
exports.getAddProduct=(req,res,next) =>{
    res.render('add-product',{pageTitle:'Add Product',path:'/admin/addproduct'});
};

exports.postAddProduct=(req,res,next) =>{
    products.push({'title':req.body.title});
    res.redirect("/");
};

exports.getProducts=(req,res,next) => {
    res.render("shop",{prods:products, path:'/',pageTitle:'Shop'});
};