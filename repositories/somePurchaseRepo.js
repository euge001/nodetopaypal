((
  somePurchaseRepo,
  paypal,
  ObjectID,
  mongoService,
  paymentService,
  subService
) => {
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

    paymentService.CreateWithPaypal(
      transactionItemObj,
      "http://localhost:8080/success",
      "http://localhost:8080/cancel",
      (err, results) => {
        if (err) {
          return cb(err);
        } else {
          return cb(null, results);
        }
      }
    );
  };

  somePurchaseRepo.BuyRecurring = (planName, description, setUpFee, cb) => {
    var planObj = {
      PlanID: ""
    };

    mongoService.Create("paypal_plans", planObj, (err, results) => {
      var returnURL =
        "http://localhost:8080/recurring_success/" + results.insertedIds[0];
      var cancelURL =
        "http://localhost:8080/recurring_cancel/" + results.insertedIds[0];

      var chargeModels = [
        subService.CreateChargeModelObj(0, "TAX"),
        subService.CreateChargeModelObj(0, "SHIPPING")
      ];

      var paymentDefinitionsArray = [
        subService.CreatePaymentDefinitionsObj(
          "Squatch Maintained Habitat Rental",
          10,
          "REGULAR",
          chargeModels,
          12,
          "MONTH",
          1
        )
      ];

      var billingPlanAttributes = subService.CreateBillingPlanAttributesObj(
        planName,
        description,
        "YES",
        cancelURL,
        returnURL,
        "fixed",
        0,
        paymentDefinitionsArray
      );

      subService.CreatePlan(billingPlanAttributes, (err, newPlan) => {
        mongoService.Update(
          "paypal_plans",
          { _id: results.insertedIds[0] },
          { PlanID: newPlan.id },
          (err, results) => {
            subService.UpdatePlanState(
              newPlan.id,
              "ACTIVE",
              (err, u_results) => {
                var shippingObj = subService.CreateBillingShippingObj(
                  "1 Boulder",
                  "",
                  "Boulder",
                  "CO",
                  80301,
                  "US"
                );

                var agreementObj = subService.CreateBillingAgreementAttributesObj(
                  "Squatch Maintained Agreement",
                  "Maintained Squatch Habitat Description",
                  new Date(Date.now() + 5000 * 60),
                  newPlan.id,
                  "PAYPAL",
                  shippingObj
                );

                subService.CreateAgreement(agreementObj, (err, response) => {
                  for (var i = 0; i < response.links.length; i++) {
                    if (response.links[i].rel == "approval_url") {
                      return cb(err, response.links[i].href);
                    }
                  }
                });
              }
            );
          }
        );
      });
    });
  };

  somePurchaseRepo.CancelOrder = (orderID, cb) => {
    mongoService.Delete(
      "paypal_orders",
      { _id: new ObjectID(orderID) },
      (err, results) => {
        return cb(err, results);
      }
    );
  };

  somePurchaseRepo.ExecuteOrder = (payerID, orderID, cb) => {
    paymentService.ExecutePayment(payerID, orderID, (err, response) => {
      return cb(err, response);
    });
  };

  somePurchaseRepo.ExecuteRecurring = (token, cb) => {
    subService.ExecuteAgreement(token, (err, results) => {
      return cb(err, results);
    });
  };

  somePurchaseRepo.GetOrder = (orderID, cb) => {
    mongoService.Read(
      "paypal_orders",
      { _id: new ObjectID(orderID) },
      (order_err, paymentObj) => {
        if (order_err) {
          return cb(order_err);
        } else {
          paymentService.GetPayment(
            paymentObj[0].OrderDetails.id,
            (err, results) => {
              return cb(err, results);
            }
          );
        }
      }
    );
  };

  somePurchaseRepo.RefundOrder = (orderID, cb) => {
    somePurchaseRepo.GetOrder(orderID, (order_err, order) => {
      if (order_err) {
        return cb(order_err);
      }
      var saleID = order.transactions[0].related_resources[0].sale.id;
      var refundPrice = Number(order.transactions[0].amount.total);
      paymentService.RefundPayment(saleID, refundPrice, (err, refund) => {
        cb(err, refund);
      });
    });
  };

  somePurchaseRepo.GetPlans = cb => {
    subService.ListPlans("ACTIVE", 10, 10, (err, plans) => {
      return cb(err, plans);
    });
  };

  somePurchaseRepo.GetRecurringDetails = (agreementID, cb) => {
    subService.GetAgreement(agreementID, (err, results) => {
      return cb(err, results);
    });
  };
})(
  module.exports,
  require("paypal-rest-sdk"),
  require("mongodb").ObjectID,
  require("../services/mongoService.js"),
  require("../services/paymentService.js"),
  require("../services/subscriptionService.js")
);
