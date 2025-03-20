import { ORDERS_STATUS, PAYMENT_METHOD } from '#src/core/constant';
import { BadRequestException, NotFoundException } from '#src/core/exception/http-exception';
import { getOrderByIdService, updateOrderByIdService } from '#src/app/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { createPaymentService, getPaymentByOrderIdService } from '#src/app/payments/payments.service';
import { createMomoPayment } from '#src/utils/paymentMomo';
import { createVnpayPayment } from '#src/utils/paymentVnpay';
import moment from 'moment-timezone';

export const createPaymentController = async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  const orderExisted = await getOrderByIdService(orderId);
  if (!orderExisted) {
    throw new NotFoundException('Order not found');
  }

  let transactionId = null;
  let paymentUrl;
  let notes = '';

  if (!paymentMethod) {
    throw new NotFoundException('Invalid payment method');
  }

  if (paymentMethod === PAYMENT_METHOD.MOMO) {
    transactionId = `${PAYMENT_METHOD.MOMO}_${orderExisted._id}`;
    notes = `Payment via ${PAYMENT_METHOD.MOMO}`;
    const momoResponse = await createMomoPayment(orderId, orderExisted.total, orderExisted.code);
    paymentUrl = momoResponse.payUrl;
  }

  if (paymentMethod === PAYMENT_METHOD.VNPAY) {
    transactionId = `${PAYMENT_METHOD.VNPAY}_${orderExisted._id}`;
    notes = `Payment via ${PAYMENT_METHOD.VNPAY}`;
    paymentUrl = await createVnpayPayment(orderId, orderExisted.total, orderExisted.code);
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
      status: ORDERS_STATUS.SHIPPING,
      paymentId: newPayment._id,
    });
  }

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Create payment successfully',
    data: {
      newPayment,
      paymentUrl,
    },
  };
};

export const returnPaymentMomoController = async (req, res) => {
  const { orderId, resultCode } = req.query;
  if (resultCode !== 0) {
    throw new BadRequestException('Payment failed');
  }
  const paymentExited = await getPaymentByOrderIdService(orderId);
  if (!paymentExited) {
    throw new NotFoundException('Payment record not found');
  }

  //create payment

  await updateOrderByIdService(orderId, {
    isPath: true,
    status: ORDERS_STATUS.SHIPPING,
    paymentId: paymentExited._id,
  });

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Payment Momo successfully',
    data: { orderId, paymentId: paymentExited._id },
  };
};

export const returnPaymentVnPayController = async (req, res) => {
  const { vnp_ResponseCode, vnp_TxnRef } = req.query;
  console.log(req.query);
  if (vnp_ResponseCode !== '00') {
    throw new BadRequestException('Payment failed');
  }

  const paymentExited = await getPaymentByOrderIdService(vnp_TxnRef);
  if (!paymentExited) {
    throw new NotFoundException('Payment record not found');
  }

  await updateOrderByIdService(vnp_TxnRef, {
    isPath: true,
    status: ORDERS_STATUS.SHIPPING,
    paymentId: paymentExited._id,
  });
  return {
    statusCode: HttpStatus.OK,
    message: 'Payment VnPay successfully',
    data: { orderId: vnp_TxnRef, paymentId: paymentExited._id },
  };
};

//
