((express, server, bodyParser, fs, somePurchaseRepo) => {
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(express.static("public"));
  //Describe Server
  //--------------------------------------------------------

  server.listen(8080, "localhost", err => {
    if (err) {
      console.log("error", err);
    } else {
      console.log("server online");
    }
  });

  //--------------------------------------------------------
  //Home Page

  server.get("/", (req, res) => {
    fs.readFile("./templates/index.html", (err, results) => {
      res.send(results.toString());
    });
  });

  //--------------------------------------------------------
  //Purchases

  server.post("/buysingle", (req, res) => {
    var quantity = req.body.Quantity;
    var purchaseName = "Some purchase";
    var purchasePrice = 10.0;
    var taxPrice = 0;
    var shippingPrice = 0;
    var description = "Some purchase description";
    somePurchaseRepo.BuySingle(
      purchaseName,
      purchasePrice,
      taxPrice,
      shippingPrice,
      quantity,
      description,
      (err, url) => {
        if (err) {
          res.json(err);
        } else {
          res.redirect(url);
        }
      }
    );
  });

  server.get("/cancel/:orderID", (req, res) => {
    var orderID = req.params.orderID;
    somePurchaseRepo.CancelOrder(orderID, (err, results) => {
      if (err) {
        res.send("There was an error removing this order");
      } else {
        res.redirect("/");
      }
    });
  });

  server.get("/success/:orderID", (req, res) => {
    var orderID = req.params.orderID;
    var payerID = req.query.PayerID;
    somePurchaseRepo.ExecuteOrder(payerID, orderID, (err, successID) => {
      if (err) {
        res.json(err);
      } else {
        res.send(
          "<h1>Order is done</h1>Please save your order confirmation number : <h3>" +
            successID +
            "</h3>"
        );
      }
    });
  });

  server.get("/refund/:orderID", (req, res) => {
    var orderID = req.params.orderID;
    somePurchaseRepo.RefundOrder(orderID, (err, refund) => {
      if (err) {
        res.json(err);
      } else {
        res.json(refund);
      }
    });
  });

  server.get("/orderdetails/:orderID", (req, res) => {
    var orderID = req.params.orderID;
    somePurchaseRepo.GetOrder(orderID, (err, results) => {
      if (err) {
        res.json(err);
      } else {
        res.json(results);
      }
    });
  });

  //--------------------------------------------------------
  //Recurring

  server.post("/buyrecurring", (req, res) => {
    somePurchaseRepo.BuyRecurring(
      "Squatch Plan",
      "Recurring Squatch Plan",
      0,
      (err, plan) => {
        if (err) {
          res.json(err);
        } else {
          res.redirect(plan);
        }
      }
    );
  });

  server.get("/recurring_success/:planID", (req, res) => {
    var planID = req.params.planID;
    var token = req.query.token;
    somePurchaseRepo.ExecuteRecurring(token, (err, results) => {
      if (err) {
        res.json(err);
      } else {
        res.json(results);
      }
    });
  });

  server.get("/recurring_cancel/:planID", (req, res) => {
    var planID = req.params.planID;
    //remove from mongoDB
  });

  server.get("/recurring_orderdetails/:agreementID", (req, res) => {
    var agreementID = req.params.agreementID;
    somePurchaseRepo.GetRecurringDetails(
      agreementID,
      (err, recurring_orderdetails) => {
        if (err) {
          res.json(err);
        } else {
          res.json(recurring_orderdetails);
        }
      }
    );
  });
})(
  require("express"),
  require("express")(),
  require("body-parser"),
  require("fs"),
  require("./repositories/somePurchaseRepo.js")
);
