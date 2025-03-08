import axios from "axios";
import crypto from "crypto";
import moment from "moment";

// ✅ Tạo thanh toán Momo
export const createMomoPayment = async (order_id, amount) => {
  var partnerCode = "MOMO";
  var accessKey = "F8BBA842ECF85";
  var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var requestId = `${partnerCode}_${moment().format("YYYYMMDDHHmmss")}`;
  var orderId = `${partnerCode}_${order_id}`;
  var orderInfo = `Pay Order: ${order_id}`;
  var redirectUrl =
    "http://localhost:3000/api/v1/payments/check-payment-return-momo";
  var ipnUrl = "http://localhost:3000/api/v1/payments/notify-momo";
  var amount = amount;
  var requestType = "captureWallet";
  var extraData = "";

  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;

  //signature
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });

  const response = await axios.post(
    "https://test-payment.momo.vn/v2/gateway/api/create",
    requestBody,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
