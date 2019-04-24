const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const transporter=nodemailer.createTransport(sendgridTransport({
auth:{
  api_key:'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'
}
}));


exports.getLogin = (req, res, next) => {
  let message=req.flash('error');
  if(message.length>0){
    message=message[0];
  } else{
    message=null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage:message
  });
};

exports.postLogin = (req, res, next) => {
  //res.setHeader('Set-Cookie','loggedIn=true');
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({where:{ email: email }})
    .then(user => {
      if (!user) {
        req.flash('error','Invalid email.');
        return req.session.save(err=>{
          res.redirect("/login");
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
          req.flash('error','Invalid password.');
          return req.session.save(err=>{
            res.redirect("/login");
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
  let message=req.flash('error');
  if(message.length>0){
    message=message[0];
  } else{
    message=null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage:message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ where: { email: email } })
    .then(userDoc => {
      if (userDoc){
        req.flash('error','Email already exists!');
        return req.session.save(err=>{
          res.redirect("/signup");
        });       
      } 
      return bcrypt
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
          return transporter.sendMail({
            to:email,
            from:'kunalindoliya@gmail.com',
            subject:'Signup Succeeded',
            html:'You have successfull signed up'
          });
        }).catch(err=>console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
