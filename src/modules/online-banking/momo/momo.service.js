import { Code } from '#src/core/code/Code';
import { HttpException } from '#src/core/exception/http-exception';
import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';

// ✅ Tạo thanh toán Momo
export const createMomoPaymentService = async (baseUrl, redirectUrl = '', orderId, amount) => {
  const serverUrl = process.env.NODE_ENV === 'production' ? baseUrl : process.env.SERVER_NGROK_URL;

  var partnerCode = 'MOMO';
  var accessKey = process.env.MOMO_ACCESS_KEY;
  var secretKey = process.env.MOMO_SECRET_KEY;
  var requestId = `${partnerCode}_${moment().format('YYYYMMDDHHmmss')}`;
  var orderId = `${orderId}`;
  var orderInfo = `Pay Momo for Order: ${orderId}`;
  var redirectUrl = redirectUrl;
  var ipnUrl = `${serverUrl}/api/payments/return-payment-momo`;
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

  try {
    const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestBody.length,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error create Momo payment:', error);
    throw HttpException.new({ code: Code.SERVICE_UNAVAILABLE, overrideMessage: 'Create payment Momo failed' });
  }
};

// ✅ Refund Momo
export const refundMomoPaymentService = async (orderId, payment) => {
  var partnerCode = 'MOMO';
  var orderId = `${orderId}`;
  var requestId = `${partnerCode}_${moment().format('YYYYMMDDHHmmss')}`;
  var amount = payment.amountPaid;
  var transId = payment.transactionId;

  var accessKey = process.env.MOMO_ACCESS_KEY;
  var secretKey = process.env.MOMO_SECRET_KEY;

  var rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&orderId=' +
    orderId +
    '&partnerCode=' +
    partnerCode +
    '&requestId=' +
    requestId +
    '&transId=' +
    transId;

  //signature
  var signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    signature: signature,
    lang: 'en',
  });

  try {
    const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/refund', requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error refund Momo payment:', error.message);
  }
};
