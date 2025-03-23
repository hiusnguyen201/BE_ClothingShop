import { ORDERS_STATUS, PAYMENT_METHOD } from '#src/core/constant';
import { HttpException } from '#src/core/exception/http-exception';
import { getOrderByIdService, updateOrderByIdService } from '#src/app/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { createPaymentService } from '#src/app/payments/payments.service';
import { createMomoPayment } from '#src/utils/paymentMomo';
import { createVnpayPayment } from '#src/utils/paymentVnpay';
import moment from 'moment-timezone';
import { Code } from '#src/core/code/Code';

export const createPaymentController = async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  const orderExisted = await getOrderByIdService(orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  let transactionId = null;
  let paymentUrl;
  let notes = '';

  if (!paymentMethod) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Payment method not found' });
  }

  if (paymentMethod === PAYMENT_METHOD.MOMO) {
    transactionId = `${PAYMENT_METHOD.MOMO}_${orderExisted._id}`;
    notes = `Payment via ${PAYMENT_METHOD.MOMO}`;
    const momoResponse = await createMomoPayment(orderId, orderExisted.total, orderExisted.code);
    paymentUrl = momoResponse.payUrl;
    return paymentUrl;
  }

  if (paymentMethod === PAYMENT_METHOD.VNPAY) {
    transactionId = `${PAYMENT_METHOD.VNPAY}_${orderExisted._id}`;
    notes = `Payment via ${PAYMENT_METHOD.VNPAY}`;
    paymentUrl = await createVnpayPayment(orderId, orderExisted.total, orderExisted.code);
    return paymentUrl;
  }

  if (paymentMethod === PAYMENT_METHOD.COD) {
    transactionId = `${PAYMENT_METHOD.COD}_${orderExisted._id}`;
    notes = 'Cash on Delivery';
  }

  const paidDate = moment().format('YYYY-MM-DD HH:mm:ss');

  const newPayment = await createPaymentService({
    orderId,
    paymentMethod,
    amountPaid: orderExisted.total,
    transactionId,
    notes,
    paidDate,
  });

  if (newPayment.paymentMethod === PAYMENT_METHOD.COD) {
    await updateOrderByIdService(orderExisted._id, {
      paymentId: newPayment._id,
    });
  }

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Create payment successfully',
    data: {
      paymentUrl,
      notes,
    },
  };
};

export const returnPaymentMoMoController = async (req, res) => {
  const { orderId, resultCode, amount, transId, orderInfo, responseTime } = req.query;
  if (resultCode !== '0') {
    await updateOrderByIdService(orderId, {
      status: ORDERS_STATUS.CANCELLED,
    });
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Payment false' });
  }

  const orderExisted = await getOrderByIdService(orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const newPayment = await createPaymentService({
    orderId: orderExisted._id,
    paymentMethod: PAYMENT_METHOD.MOMO,
    amountPaid: amount,
    transactionId: transId,
    notes: orderInfo,
    paidDate: responseTime,
  });
  if (newPayment) {
    await updateOrderByIdService(orderId, {
      isPaid: true,
      paymentId: newPayment._id,
    });
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'Payment Momo successfully',
    data: { orderId, newPayment },
  };
};

export const returnPaymentVnPayController = async (req, res) => {
  const { vnp_ResponseCode, vnp_TxnRef, vnp_PayDate, vnp_Amount, vnp_TransactionNo, vnp_OrderInfo } = req.query;

  if (vnp_ResponseCode !== '00') {
    await updateOrderByIdService(vnp_TxnRef, {
      status: ORDERS_STATUS.CANCELLED,
    });
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Payment false' });
  }

  const orderExisted = await getOrderByIdService(vnp_TxnRef);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  const newPayment = await createPaymentService({
    orderId: orderExisted._id,
    paymentMethod: PAYMENT_METHOD.VNPAY,
    amountPaid: vnp_Amount / 100,
    transactionId: vnp_TransactionNo,
    notes: vnp_OrderInfo,
    paidDate: vnp_PayDate,
  });

  await updateOrderByIdService(vnp_TxnRef, {
    isPaid: true,
    paymentId: newPayment._id,
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'Payment VnPay successfully',
    data: { orderId: vnp_TxnRef, newPayment },
  };
};

export const returnPaymentCodController = async (req, res) => {
  return {
    statusCode: HttpStatus.OK,
    message: 'Payment Cod successfully',
    data: {},
  };
};
