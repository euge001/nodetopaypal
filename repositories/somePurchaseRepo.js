((somePurchaseRepo, paypal, ObjectID, mongoService, paymentService) => {
  somePurchaseRepo.BuySingle = (
    purchaseName,
    purchasePrice,
    taxPrice,
    shippingPrice,
    itemCount,
    description,
    cb
  ) => {
    var transactionArray = [];
    for (var i = 0; i < itemCount; i++) {
      var itemObj = paymentService.CreateItemObj(
        purchaseName,
        purchasePrice,
        1
      );
      transactionArray.push(itemObj);
    }
    var transactionItemObj = [
      paymentService.CreateTransactionObj(
        taxPrice,
        shippingPrice,
        description,
        transactionArray
      )
    ];
    paymentService.CreateWithPaypal(transactionItemObj),
      "http://localhost:7070/success",
      "http://localhost:7070/cancel",
      (err, results) => {
        if (err) {
          return cb(err);
        } else {
          return cb(null, results);
        }
      };
  };
})(
  module.exports,
  require("paypal-rest-sdk"),
  require("mongodb").ObjectID,
  require("../services/mongoService.js"),
  require("../services/paymentService.js")
);
