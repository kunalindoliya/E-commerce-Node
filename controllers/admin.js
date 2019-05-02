const Product = require("../models/product");
const { validationResult } = require("express-validator/check");
const fileHelper = require("../util/file");

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
  console.log("in add");
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const errors = validationResult(req);
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/addproduct",
      editing: false,
      hasError: true,
      product: {
        title: title,
        description: description,
        price: price
      },
      errorMessage: "Attached file is not an image.",
      validationError: []
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/addproduct",
      editing: false,
      hasError: true,
      product: {
        title: title,
        description: description,
        price: price
      },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array()
    });
  }
  console.log("In add");
  const imageUrl = "/" + image.path;
  req.user
    .createProduct({
      title: title,
      imageUrl: imageUrl,
      description: description,
      price: price
    })
    .then(result => {
      console.log("product created");
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode(500);
      next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const image = req.file;
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
        description: description,
        price: price,
        id: id
      },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array()
    });
  }
  Product.findByPk(id)
    .then(product => {
      if (product.userId !== req.user.id) {
        return res.redirect("/");
      }
      product.title = title;
      if (image) {
        fileHelper(product.imageUrl);
        product.imageUrl = "/" + image.path;
      }
      product.description = description;
      product.price = price;
      return product.save().then(result => {
        res.redirect("/admin/products");
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.productId;
  Product.findByPk(id)
    .then(product => {
      if (!product) return next(new Error("Product not found!"));
      fileHelper(product.imageUrl);
      return Product.destroy({
        where: {
          id: id,
          userId: req.user.id
        }
      });
    })
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
