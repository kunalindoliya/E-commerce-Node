const express = require("express");
const path = require("path");
const app = express();
// view engine setup
app.set("views", "views");
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(express.static(path.join(__dirname, "public")));
const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");
//creating middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" }); //many to one relationship
User.hasMany(Product); //one to many relationship
User.hasOne(Cart); //one to one relationship
Cart.belongsTo(User);//one to one
Cart.belongsToMany(Product,{through:CartItem});
Product.belongsToMany(Cart,{through:CartItem});

sequelize
  .sync({force:true})
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) return User.create({ name: "Max", email: "max@gmail.com" });
    return user;
  })
  .then(user => {
    //console.log(user);
    app.listen(3000);
  })
  .catch(err => console.log(err));
