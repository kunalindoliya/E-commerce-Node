const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator/check");
const User=require('../models/user');

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login",[
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.'),
  body('password', 'Password has to be valid.')
    .isLength({ min: 5 })
    .isAlphanumeric()
], authController.postLogin);
router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email").custom((value,{req})=>{
        return User.findOne({ where: { email: value } })
        .then(user => {
          if (user) {
          return Promise.reject('Email already exists!');
          }
      });
    }),
    body('password','Please enter alphanumeric password and atleast 5 characters')
    .isLength({min:5})
    .isAlphanumeric(),
    body('confirmPassword').custom((value,{req})=>{
      if(value !== req.body.password){
          throw new Error('Password must be matched!');
      }
      return true;
    })
  ],
  authController.postSignup
);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);
module.exports = router;
