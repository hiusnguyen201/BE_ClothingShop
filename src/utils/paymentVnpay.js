import moment from "moment";
import { VNPay } from "vnpay";

const vnpayConfig = {
  tmnCode: "090WQ64T", // Nhớ dùng đúng mã TmnCode
  secretKey: "JGTX1XCK0O18L2MP7583A1AJZF8F7UGG",
  vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: "http://localhost:3000/api/v1/payments/return-payment-vnpay",
};

// ✅ Tạo thanh toán VNPAY
export const createVnpayPayment = async (orderId, amount, ipAddress) => {
  const vnpay = new VNPay({
    // Thông tin cấu hình bắt buộc
    tmnCode: vnpayConfig.tmnCode,
    secureSecret: vnpayConfig.secretKey,
    vnpayHost: vnpayConfig.vnpUrl,

    testMode: true, // Chế độ test
    hashAlgorithm: "SHA512",
  });
  const vnpayRespone = vnpay.buildPaymentUrl({
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_Amount: amount * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId, // Mã đơn hàng
    vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
    vnp_OrderType: "billpayment",
    vnp_Locale: "vn", // Ngôn ngữ hiển thị VNPAY
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddress, // Lấy địa chỉ IP từ request
    vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
  });
  return vnpayRespone;
};
