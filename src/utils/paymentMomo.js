import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';

// ✅ Tạo thanh toán Momo
export const createMomoPayment = async (order_id, amount) => {
  var partnerCode = process.env.MOMO_PARTNER_CODE;
  var accessKey = process.env.MOMO_ACCESS_KEY;
  var secretKey = process.env.MOMO_SECRET_KEY;
  var requestId = `${partnerCode}_${moment().format('YYYYMMDDHHmmss')}`;
  var orderId = `${order_id}`;
  var orderInfo = `Pay Momo for Order: ${order_id}`;
  var redirectUrl = 'http://localhost:3000/api/payments/return-payment-momo';
  var ipnUrl = 'http://localhost:3000/api/payments/notify-momo';
  var amount = amount;
  var requestType = 'captureWallet';
  var extraData = '';

  var rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType;

  //signature
  var signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

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
    lang: 'en',
  });

  const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
