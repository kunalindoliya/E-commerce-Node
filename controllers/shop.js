const Product = require("../models/product");
const Cart = require("../models/cart");
exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/product-list", {
        prods: rows,
        path: "/products",
        pageTitle: "All Products"
      });
    })
    .catch(err => console.log(err));
};
exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
    .then(([product]) => {
      res.render("shop/product-detail", {
        product: product[0],
        pageTitle: "Product Detail",
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};
exports.getIndex = (req, res, next) => {
  Product.findAll().then(products=>{
    res.render("shop/index", { prods: products, path: "/", pageTitle: "Shop" });
  }).catch(err =>console.log(err));
};
exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];
      for (let product of products) {
        const cartProductData = cart.products.find(
          prod => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartProducts
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const id = req.body.id;
  Product.findById(id, product => {
    Cart.addProduct(id, product.price);
  });
  res.redirect("/cart");
};

exports.getCartDeleteItem = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id, product => {
    Cart.deleteProduct(id, product.price);
    res.redirect("/cart");
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", { path: "/orders", pageTitle: "Orders" });
};
exports.getCheckout = (req, res, next) => {
  res.render("/checkout", { path: "/checkout" });
};
