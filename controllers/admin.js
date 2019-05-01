const Product = require("../models/product");
const { validationResult } = require("express-validator/check");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/addproduct",
    editing: false,
    errorMessage: null,
    hasError: false,
    validationError: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/addproduct",
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price
      },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array()
    });
  }
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
      const product = products[0];
      if (!product) return res.redirect("/");
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/editproduct",
        editing: true,
        product: product,
        errorMessage: null,
        hasError: false,
        validationError: []
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/addproduct",
      editing: true,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price,
        id:id
      },
      errorMessage: errors.array()[0].msg,
      validationError:errors.array()
    });
  }
  Product.findByPk(id)
    .then(product => {
      if (product.userId !== req.user.id) {
        return res.redirect("/");
      }
      product.title = title;
      product.imageUrl = imageUrl;
      product.description = description;
      product.price = price;
      return product.save().then(result => {
        res.redirect("/admin/products");
      });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then(products => {
      res.render("admin/product-list", {
        prods: products,
        path: "/admin/products",
        pageTitle: "All Products"
      });
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.productId;
  Product.destroy({
    where: {
      id: productId,
      userId: req.user.id
    }
  })
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};
