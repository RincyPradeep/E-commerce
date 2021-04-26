var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/*GET home page */
router.get("/", verifyLogin, (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render("admin/view-products", {
      admin: true,
      adminLogin: true,
      products,
    });
  });
});

router.get("/login", (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", {
      admin: true,
      adminLogin: false,
      loginErr: req.session.adminLoginErr,
    });
    req.session.adminLoginErr = false;
  }
});

router.post("/login", (req, res) => {
  productHelpers.doLogin(req.body).then((response) => {
    if (response.adminstatus) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      res.redirect("/admin/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin/login");
});

router.get("/change-password",verifyLogin ,(req, res) => {
  res.render("admin/change-password", {
    admin: true,
    pwErr: req.session.adminPwErr,
    adminLogin: true
  });
  req.session.adminPwErr = false;
});

router.post("/change-password", (req, res) => {
  productHelpers.changePassword(req.body).then((status) => {
    if (status) {
      console.log("Password changed");
      res.redirect("/admin");
    } else {
      req.session.adminPwErr = "Password not matching";
      res.redirect("/admin/change-password");
    }
  });
});

// For ADD a product
router.get("/add-product", verifyLogin, function (req, res) {
  res.render("admin/add-product", { admin: true, adminLogin: true });
});

router.post("/add-product", (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

/*For Deletion */
router.get("/delete-product/:id", verifyLogin, (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/");
  });
});

/*For edit */
router.get("/edit-product/:id", verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  res.render("admin/edit-product", { product, admin: true, adminLogin: true });
});

router.post("/edit-product/:id", (req, res) => {
  let id = req.params.id;
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});

router.get("/all-orders", verifyLogin, (req, res) => {
  productHelpers.placedOrders().then((placedItems) => {
    if (placedItems.length > 0)
      res.render("admin/all-orders", {
        admin: true,
        adminLogin: true,
        placedItems,
      });
    else {
      res.render("admin/all-orders", {
        admin: true,
        adminLogin: true,
        status: true,
      });
    }
  });
});

router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  res.render("user/view-order-products", { admin: true, products });
});

router.get("/all-users", verifyLogin, (req, res) => {
  productHelpers.getUserDetails().then((user) => {
    res.render("admin/all-users", { admin: true, adminLogin: true, user });
  });
});

router.get("/change-status/:id", (req, res) => {
  productHelpers.changeStatus(req.params.id).then(() => {
    console.log("Order Shipped");
    res.json({ status: true });
  });
});

router.get("/shipped-orders", (req, res) => {
  productHelpers.shippedOrders().then((shippedItems) => {
    if (shippedItems.length > 0)
      res.render("admin/shipped-orders", {
        admin: true,
        adminLogin: true,
        shippedItems,
      });
    else {
      res.render("admin/shipped-orders", {
        admin: true,
        adminLogin: true,
        status: true,
      });
    }
  });
});

module.exports = router;
