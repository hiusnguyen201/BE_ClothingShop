import {
  CURRENT_TIME,
  ORDERS_STATUS,
  PAYMENT_METHOD,
} from "#src/core/constant";
import {
  BadRequestException,
  NotFoundException,
} from "#src/core/exception/http-exception";
import {
  getOrderByIdService,
  updateOrderByIdService,
} from "#src/modules/orders/orders.service";
import HttpStatus from "http-status-codes";
import {
  createPaymentService,
  getPaymentByOrderIdService,
} from "#src/modules/payments/payments.service";
import { createMomoPayment } from "#src/utils/paymentMomo";
import { createVnpayPayment } from "#src/utils/paymentVnpay";

export const createPaymentController = async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  const orderExisted = await getOrderByIdService(orderId);
  if (!orderExisted) {
    throw new NotFoundException("Order not found");
  }

  let transactionId = null;
  let notes = "";
  let paymentUrl;
  switch (paymentMethod) {
    case PAYMENT_METHOD.MOMO:
      transactionId = `${PAYMENT_METHOD.MOMO}_${orderExisted._id}_${CURRENT_TIME}`;
      notes = `Payment via ${PAYMENT_METHOD.MOMO}`;
      const momoResponse = await createMomoPayment(orderId, orderExisted.total);
      paymentUrl = momoResponse.payUrl;
      break;

    case PAYMENT_METHOD.VNPAY:
      transactionId = `${PAYMENT_METHOD.VNPAY}_${orderExisted._id}_${CURRENT_TIME}`;
      notes = `Payment via ${PAYMENT_METHOD.VNPAY}`;
      const ipAddress = "127.0.0.1";
      paymentUrl = await createVnpayPayment(
        orderId,
        orderExisted.total,
        ipAddress
      );
      break;

    case PAYMENT_METHOD.COD:
      transactionId = `${PAYMENT_METHOD.COD}_${orderExisted._id}_${CURRENT_TIME}`;
      notes = "Cash on Delivery";
      break;

    default:
      throw new BadRequestException("Invalid payment method");
  }
  const newPayment = await createPaymentService({
    orderId,
    paymentMethod,
    amount_paid: orderExisted.total,
    transactionId,
    notes,
  });

  //update status order
  if (paymentMethod === PAYMENT_METHOD.COD) {
    await updateOrderByIdService(orderExisted._id, {
      status: ORDERS_STATUS.SHIPPED,
      paymentId: newPayment._id,
    });
  }

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create order successfully",
    data: {
      newPayment,
      paymentUrl,
    },
  };
};

export const returnPaymentMomoController = async (req, res) => {
  const { orderId, resultCode } = req.query;

  switch (resultCode) {
    case 0:
      const paymentExited = await getPaymentByOrderIdService(orderId);
      if (!paymentExited) {
        throw new NotFoundException("Payment record not found");
      }

      await updateOrderByIdService(orderId, {
        status: ORDERS_STATUS.PAID,
        paymentId: paymentExited._id,
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: "Payment Momo successfully",
        data: { orderId, paymentId: paymentExited._id },
      };
    case 10:
      throw new BadRequestException("The system is under maintenance.");
    case 9000:
      throw new BadRequestException("General error.");
    case 9001:
      throw new BadRequestException("Transaction failed.");
    case 9002:
      throw new BadRequestException("Invalid signature.");
    case 9003:
      throw new BadRequestException("Transaction declined by Momo.");
    case 9004:
      throw new BadRequestException("Transaction expired.");
    case 9005:
      throw new BadRequestException("Insufficient balance.");
    case 9006:
      throw new BadRequestException("Transaction is being processed.");
    case 9007:
      throw new BadRequestException("Customer canceled the transaction.");
    case 9008:
      throw new BadRequestException("System error. Please try again later.");
    default:
      throw new BadRequestException("Payment failed");
  }
};

export const returnPaymentVnPayController = async (req, res) => {
  const { vnp_ResponseCode, vnp_TxnRef } = req.query;
  switch (vnp_ResponseCode) {
    case "00":
      const paymentExited = await getPaymentByOrderIdService(vnp_TxnRef);
      if (!paymentExited) {
        throw new NotFoundException("Payment record not found");
      }

      await updateOrderByIdService(vnp_TxnRef, {
        status: ORDERS_STATUS.PAID,
        paymentId: paymentExited._id,
      });
      return {
        statusCode: HttpStatus.OK,
        message: "Payment VnPay successfully",
        data: { orderId: vnp_TxnRef, paymentId: paymentExited._id },
      };
    case "07":
      throw new BadRequestException(
        "Money deducted successfully, but the transaction is suspected."
      );
    case "09":
      throw new BadRequestException("Refund transaction declined.");
    case "10":
      throw new BadRequestException("Transaction not supported.");
    case "11":
      throw new BadRequestException("Transaction has expired.");
    case "12":
      throw new BadRequestException("Card/Account is locked.");
    case "13":
      throw new BadRequestException("Invalid transaction amount.");
    case "24":
      throw new BadRequestException("Customer canceled the transaction.");
    case "51":
      throw new BadRequestException("Insufficient account balance.");
    case "65":
      throw new BadRequestException(
        "Account locked due to multiple incorrect PIN entries."
      );
    case "75":
      throw new BadRequestException("Bank is under maintenance.");
    case "79":
      throw new BadRequestException("Transaction conditions not met.");

    case "97":
      throw new BadRequestException("Invalid signature.");
    case "98":
      throw new BadRequestException("Transaction timeout.");
    case "99":
      throw new BadRequestException("VNPAY system error.");
    default:
      throw new BadRequestException("Payment failed");
  }
};
