import express from 'express';

import { validateSchema } from '#src/core/validations/request.validation';
import { createPaymentController } from '#src/app/v1/payments/payments.controller';
import { createPaymentDto } from '#src/app/v1/payments/dto/create-payments.dto';
import moment from 'moment-timezone';
import crypto from 'crypto';
import querystring from 'qs';

const router = express.Router();

router.post('/create-payment', validateSchema(createPaymentDto), createPaymentController);

router.post('/create-payment-vnpay', (req, res, next) => {
  var ipAddr = '127.0.0.1';

  var tmnCode = '6XI6FQXW';
  var secretKey = 'WE2L54LT84O1DSEHRXQLVMUH037ZM19K';
  var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  var returnUrl = 'http://localhost:3000/api/v1/payments/return-payment-vnpay';

  var date = new Date();

  var createDate = moment(date).format('YYYYMMDDHHmmss');
  var orderId = moment(date).format('DDHHmmss');
  var amount = 10000;
  var bankCode = 'VNPAYQR';

  var orderInfo = 'aaassss';
  var orderType = 'other';

  var currCode = 'VND';
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  // vnp_Params['vnp_Merchant'] = ''
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  //   if (bankCode !== null && bankCode !== '') {
  //     vnp_Params['vnp_BankCode'] = bankCode;
  //   }

  vnp_Params = sortObject(vnp_Params);

  console.log(vnp_Params);

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  return vnpUrl;
});

// router.get('/return-payment-momo', returnPaymentMomoController);
router.get('/return-payment-vnpay', (req) => {
  console.log(req.query);
  return req.query;
});

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

export default router;
