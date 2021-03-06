const express = require("express");
const path = require("path");
const app = express();
// view engine setup
app.set("views", "views");
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const multer = require("multer");
const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize
});
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require("connect-flash");
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files');
  },
  filename: (req, file, cb) => {
    cb(null,  Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

//creating middleware
app.use(express.static(path.join(__dirname, "public")));
app.use('/files',express.static(path.join(__dirname, "files")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(
  session({
    secret: "my secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
);

app.use(csrfProtection);
app.use(flash());

//adding protection
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => next(new Error(err)));
});

app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(authRoutes);
//error handling routes
app.get("/500", errorController.get500);
app.use(errorController.get404);
//central middleware for error handling
app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/500");
});

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" }); //many to one relationship
User.hasMany(Product); //one to many relationship
User.hasOne(Cart); //one to one relationship
Cart.belongsTo(User); //one to one
Cart.belongsToMany(Product, { through: CartItem }); //many to many relationship
Product.belongsToMany(Cart, { through: CartItem }); //many to many
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem }); //inverse is optional

sequelize
  //.sync({force:true})
  .sync()
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
