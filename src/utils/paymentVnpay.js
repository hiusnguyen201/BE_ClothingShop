import moment from 'moment-timezone';
import crypto from 'crypto';
import querystring from 'qs';
import { PAYMENT_METHOD } from '#src/core/constant';

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

// ✅ Tạo thanh toán VNPAY
export const createVnpayPayment = async (orderId, amountOder, orderCode) => {
  var ipAddr = '127.0.0.1';

  var tmnCode = process.env.VNPAY_TMN_CODE;
  var secretKey = process.env.VNPAY_SECRET_KEY;
  var vnpUrl = process.env.VNPAY_URL;
  var returnUrl = process.env.VNPAY_RETURN_URL;

  var date = new Date();

  var createDate = moment(date).format('YYYYMMDDHHmmss');
  var amount = 100000;

  var orderInfo = `Payment via ${PAYMENT_METHOD.VNPAY} ${orderCode}`;
  var orderType = 'other';

  var currCode = 'VND';
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  vnp_Params = sortObject(vnp_Params);

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
  return vnpUrl;
};
