const Product = require("../models/product");
const Cart = require("../models/cart");
const fs = require("fs");
const path = require("path");
const Order = require("../models/order");
const PDFdocument = require("pdfkit");
const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.count()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.findAll({
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE
      });
    })
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        path: "/products",
        pageTitle: "All Products",
        currentPage:page,
        hasNextPage:ITEMS_PER_PAGE*page < totalItems,
        hasPreviousPage:page>1,
        nextPage:page +1,
        previousPage:page-1,
        lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findByPk(id)
    .then(product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product Detail",
        path: "/products"
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.count()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.findAll({
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE
      });
    })
    .then(products => {
      res.render("shop/index", {
        prods: products,
        path: "/",
        pageTitle: "Shop",
        currentPage:page,
        hasNextPage:ITEMS_PER_PAGE*page < totalItems,
        hasPreviousPage:page>1,
        nextPage:page +1,
        previousPage:page-1,
        lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      if (!cart) {
        cart = req.user.createCart();
      }
      return cart.getProducts().then(products => {
        res.render("shop/cart", {
          path: "/cart",
          pageTitle: "Your Cart",
          products: products
        });
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const id = req.body.id;
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: id } });
    })
    .then(products => {
      let product;
      if (products.length > 0) product = products[0];
      let newQuantity = 1;
      if (product) {
        let oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return fetchedCart.addProduct(product, {
          through: { quantity: newQuantity }
        });
      }
      return Product.findByPk(id)
        .then(product => {
          return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity }
          });
        })
        .catch(err => console.log(err));
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const id = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: id } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch(err => console.log(err));
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.redirect("/orders");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);
  Order.findOne({ where: { id: orderId }, include: ["products"] })
    .then(order => {
      if (!order) {
        return next(new Error("Order not found"));
      }
      if (order.userId !== req.user.id) {
        return next(new Error("Unauthorized access!"));
      }

      const pdfDoc = new PDFdocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true
      });
      pdfDoc.fontSize(14).text("--------------------");
      let totalPrice = 0;
      order.products.forEach(product => {
        totalPrice += product.orderItem.quantity * product.price;
        pdfDoc.text(
          product.title +
            " - " +
            product.orderItem.quantity +
            " x " +
            " $ " +
            product.price
        );
      });
      pdfDoc.text("-----------------");
      pdfDoc.text("Total Price: $" + totalPrice);
      pdfDoc.end();

      // fs.readFile(invoicePath,(err,data)=>{
      //   if(err){
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type','application/pdf');
      //   res.setHeader('Content-Disposition','attachment; filename="'+invoiceName+'"');
      //   res.send(data);
      // });
      // const file=fs.createReadStream(invoicePath);
      // file.pipe(res);
    })
    .catch(err => {
      next(err);
    });
};

exports.getCheckout = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      if (!cart) {
        cart = req.user.createCart();
      }
      return cart.getProducts().then(products => {
        let total=0;
        products.forEach(p=>{
          total+=p.cartItem.quantity*p.price;
        });
        res.render("shop/checkout", {
          path: "/checkout",
          pageTitle: "Checkout",
          products: products,
          total:total
        });
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
