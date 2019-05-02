const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator/check");

router.get("/addproduct", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post("/addproduct", [
    body("title",'Title should have atleast 3 characters')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price",'Please enter decimal price!').isFloat(),
    body("description",'Description should be of atleast 5 character and atmost 400 characters')
      .isLength({ min: 5, max: 400 })
      .trim()
  ], isAuth, adminController.postAddProduct);
router.get("/editproduct/:id", isAuth, adminController.getEditProduct);
router.post(
  "/editproduct",
  [
    body("title",'Title should have atleast 3 characters')
      .isString()
      .trim()
      .isLength({ min: 3 }),
    body("price",'Please enter decimal price!').isFloat(),
    body("description",'Description should be of atleast 5 character and atmost 400 characters')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);
router.post("/deleteproduct/:id", isAuth, adminController.deleteProduct);
module.exports = router;
