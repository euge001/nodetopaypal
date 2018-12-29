((express, server, bodyParser, fs, somePurchaseRepo) => {
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(express.static("public"));
  //Describe Server
  server.listen(7070, "localhost", err => {
    console.log(err || "Server works just fine!");
  });
  //Describe Routes
  server.get("/", (req, res) => {
    fs.readFile("./templates/index.html", (err, results) => {
      res.send(results.toString());
    });
  });
  server.get("/success/:orderID", (req, res) => {
    var orderID = req.params.orderID;
  });
  server.get("/orderdetils/:orderID", (req, res) => {
    var orderID = req.params.orderID;
  });
  server.get("/cancel/:orderID", (req, res) => {
    var orderID = req.params.orderID;
  });
  server.get("/refund/:orderID", (req, res) => {
    var orderID = req.params.orderID;
  });
  server.get("/recurring_success/:planID", (req, res) => {
    var planID = req.params.planID;
  });
  server.get("/recurring_orderdetils/:agreementID", (req, res) => {
    var agreementID = req.params.agreementID;
  });
  server.get("/recurring_cancel/:planID", (req, res) => {
    var planID = req.params.planID;
  });
  server.post("/purchase", (req, res) => {
    var quantity = req.body.Quantity;
    var purchaseName = "One Something";
    var purchasePrice = 100.0;
    var taxPrice = 0;
    var shippingPrice = 0;
    var description = "One of Something";

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
  server.post("/purchaserecurring", (req, res) => {});
})(
  require("express"),
  require("express")(),
  require("body-parser"),
  require("fs"),
  require("./repositories/somePurchaseRepo.js")
);
