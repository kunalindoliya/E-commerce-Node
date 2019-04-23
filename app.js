const express = require("express");
const path = require("path");
const app = express();
// view engine setup
app.set("views", "views");
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
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
const sessionStore=new SequelizeStore({
db:sequelize
});

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
//creating middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "my secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
);


app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use(errorController.get404);

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
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) return User.create({ name: "Max", email: "max@gmail.com" });
    return user;
  })
  .then(user => {
    user.createCart();
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
