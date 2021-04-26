var express = require("express");
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  res.render("user/home", { user, cartCount });
});

router.get("/signup", (req, res) => {
  res.render("user/signup", { signupErr: req.session.userSignupErr });
  req.session.userSignupErr = false;
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.user = response.data;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      req.session.userSignupErr = "Email Id already exist";
      res.redirect("/signup");
    }
  });
});

router.get("/login", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      req.session.userLoginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
});

router.get("/view-products", verifyLogin, async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });
});

router.get("/cart", verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  if (cartCount == 0) {
    res.render("user/cart", { user: req.session.user, cartCount });
  } else {
    let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
    res.render("user/cart", {
      products,
      user: req.session.user,
      cartCount,
      totalValue,
      status: true,
    });
  }
});

router.get("/add-to-cart/:id", (req, res) => {
  userHelpers
    .addToCart(req.params.id, req.session.user._id)
    .then((response) => {
      res.json({ status: true });
    });
});

router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});

router.post("/remove-product", (req, res, next) => {
  userHelpers.removeProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/place-order", verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  let profile = await userHelpers.getProfile(req.session.user._id);
  res.render("user/place-order", { total, user: req.session.user, profile });
});

router.post("/place-order", async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body["payment-method"] === "COD") {
      res.json({ codSuccess: true });
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response);
      });
    }
  });
});

router.get("/order-success", verifyLogin, (req, res) => {
  res.render("user/order-success", { user: req.session.user });
});

router.get("/orders", verifyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  if (orders.length > 0) {
    res.render("user/orders", { user: req.session.user, orders, cartCount });
  } else {
    res.render("user/orders", {
      user: req.session.user,
      cartCount,
      status: true,
    });
  }
});

router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  res.render("user/view-order-products", { user: req.session.user, products });
});

router.post("/verify-payment", (req, res) => {
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("Payment Successfull");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});

router.get("/profile", async (req, res) => {
  let profile = await userHelpers.getProfile(req.session.user._id);
  res.render("user/profile", { user: req.session.user, profile });
});

router.post("/profile", (req, res) => {
  console.log(req.body);
  userHelpers.makeProfile(req.body, req.session.user._id).then(() => {
    res.redirect("/");
  });
});

router.get("/change-password", (req, res) => {
  res.render("user/change-password", {
    user: req.session.user,
    pwErr: req.session.userPwErr,
  });
  req.session.userPwErr = false;
});

router.post("/change-password", (req, res) => {
  userHelpers.changePassword(req.body, req.session.user._id).then((status) => {
    if (status) {
      console.log("Password changed");
      res.redirect("/");
    } else {
      req.session.userPwErr = "Password not matching";
      res.redirect("/change-password");
    }
  });
});
module.exports = router;
