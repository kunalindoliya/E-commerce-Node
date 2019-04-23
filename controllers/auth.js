const User = require("../models/user");
const bcrypt = require("bcryptjs");
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie','loggedIn=true');
  User.findByPk(1)
    .then(user => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save(err => {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      });
    })
    .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ where: { email: email } })
    .then(userDoc => {
      if (userDoc) return res.redirect("/signup");
      return bcrypt.hash(password, 10);
    })
    .then(hashValue => {
      const user = new User({
        email: email,
        password: hashValue
      });
      return user.save();
    })
    .then(result => {
      res.redirect("/login");
    })
    .catch(err => console.log(err));
};

exports.getLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
