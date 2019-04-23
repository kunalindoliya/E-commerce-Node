const User = require("../models/user");
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
      res.redirect("/");
    })
    .catch(err => console.log(err));
};

exports.getLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
