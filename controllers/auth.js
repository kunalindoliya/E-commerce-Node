const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Sequelize = require("sequelize");
const { validationResult } = require("express-validator/check");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const key = process.env.SENDGRID_API_KEY;
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: key
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: { email: "", password: "" },
    validationError: []
  });
};

exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie','loggedIn=true');
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationError: errors.array()
    });
  }

  User.findOne({ where: { email: email } })
    .then(user => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid Email!",
          oldInput: { email: email, password: password },
          validationError: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save(err => {
              if (err) {
                console.log(err);
              }
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid Password",
            oldInput: { email: email, password: password },
            validationError: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationError: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationError: errors.array()
    });
  }

  bcrypt
    .hash(password, 10)
    .then(hashValue => {
      const user = new User({
        email: email,
        password: hashValue
      });
      return user.save();
    })
    .then(result => {
      res.redirect("/login");
      // return transporter.sendMail({
      //   to: email,
      //   from: "kunalindoliya@gmail.com",
      //   subject: "Signup Succeeded",
      //   html: "You have successfull signed up"
      // });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (!user) {
          req.flash("error", "No user found with that email.");
          return req.session.save(err => {
            res.redirect("/reset");
          });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect("/");
        return transporter.sendMail({
          to: req.body.email,
          from: "kunalindoliya@gmail.com",
          subject: "Change Password",
          html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</a>
        `
        });
      })
      .catch(err => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Sequelize.Op.gt]: Date.now() }
    }
  })
    .then(user => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user.id.toString(),
        passwordToken: token
      });
    })
    .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;
  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Sequelize.Op.gt]: Date.now() },
      id: userId
    }
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 10);
    })
    .then(hashValue => {
      resetUser.password = hashValue;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = null;
      return resetUser.save();
    })
    .then(result => {
      res.redirect("/login");
    })
    .catch(err => console.log(err));
};
