const Product = require("../models/product");
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/addproduct",
    editing: false,
    isAuthenticated:req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  req.user
    .createProduct({
      title: title,
      imageUrl: imageUrl,
      description: description,
      price: price
    })
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const id = req.params.id;
  req.user
    .getProducts({
      where: {
        id: id
      }
    })
    .then(products => {
      const product=products[0];
      if (!product) return res.redirect("/");
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/editproduct",
        editing: true,
        product: product,
        isAuthenticated:req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  Product.findByPk(id)
    .then(product => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.description = description;
      product.price = price;
      return product.save();
    })
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
    .then(products => {
      res.render("admin/product-list", {
        prods: products,
        path: "/admin/products",
        pageTitle: "All Products",
        isAuthenticated:req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  const id = req.params.id;
  Product.destroy({
    where: {
      id: id
    }
  })
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};
