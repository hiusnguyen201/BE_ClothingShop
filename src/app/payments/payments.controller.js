import { ORDERS_STATUS, PAYMENT_METHOD } from '#src/core/constant';
import { HttpException } from '#src/core/exception/http-exception';
import {
  getOrderByIdService,
  updateOrderByIdService
} from '#src/app/orders/orders.service';
import HttpStatus from 'http-status-codes';
import {
  newPaymentService,
  updatePaymentByIdService
} from '#src/app/payments/payments.service';
import { createMomoPayment } from '#src/utils/paymentMomo';
import { createVnpayPayment } from '#src/utils/paymentVnpay';
import moment from 'moment-timezone';
import { Code } from '#src/core/code/Code';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PaymentDto } from '#src/app/payments/dtos/payment.dto';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';

export const createPaymentController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId, paymentMethod } = req.body;

    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (orderExisted.status == ORDERS_STATUS.CANCELLED) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Order is cancelled' });
    }

    if (orderExisted.status == ORDERS_STATUS.DELIVERED) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Order is deliverd' });
    }

    let paymentUrl;

    if (orderExisted.paymentId) {
      if (orderExisted.paymentId.paidDate) {
        throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Order is paid' });
      }

      if (orderExisted.paymentId.paymentMethod == paymentMethod) {
        throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Payment for order is existed' });
      }
      // await updatePaymentByIdService(orderExisted.paymentId, {
      //   payUrl: paymentUrl
      // }, session)

      // const paymentDto = ModelDto.new(PaymentDto, newPayment);
      // return ApiResponse.success({ payment: paymentDto, paymentUrl: paymentUrl });
    }

    const newPayment = newPaymentService({
      orderId,
      paymentMethod,
    });

    if (paymentMethod == PAYMENT_METHOD.MOMO) {
      const momoResponse = await createMomoPayment(orderId, orderExisted.total);
      if (!momoResponse.payUrl) {
        throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: momoResponse });
      }

      newPayment.transactionId = `${PAYMENT_METHOD.MOMO}_${orderExisted._id}`;
      newPayment.notes = `Payment via ${PAYMENT_METHOD.MOMO}`;
      paymentUrl = momoResponse.payUrl;
    }

    if (paymentMethod === PAYMENT_METHOD.VNPAY) {
      paymentUrl = await createVnpayPayment(orderId, orderExisted.total, orderExisted.code);

      newPayment.transactionId = `${PAYMENT_METHOD.VNPAY}_${orderExisted._id}`;
      newPayment.notes = `Payment via ${PAYMENT_METHOD.VNPAY}`;
    }

    if (paymentMethod === PAYMENT_METHOD.COD) {
      newPayment.transactionId = `${PAYMENT_METHOD.COD}_${orderExisted._id}`;
      newPayment.paidDate = moment().format('YYYY-MM-DD HH:mm:ss');
      newPayment.amountPaid = orderExisted.total;
      newPayment.notes = 'Cash on Delivery';
    }

    await updateOrderByIdService(orderId, {
      paymentId: newPayment._id,
      ...(paymentUrl ? { payUrl: paymentUrl } : {}),
    }, session)

    await newPayment.save({ session });

    const paymentDto = ModelDto.new(PaymentDto, newPayment);
    return ApiResponse.success({ payment: paymentDto, paymentUrl: paymentUrl });
  });
};

export const returnPaymentMoMoController = async (req, res) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId, resultCode, amount, transId, orderInfo, responseTime } = req.query;
    if (resultCode != 0) {
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Payment false' });
    }

    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    const updatedPayment = await updatePaymentByIdService(orderExisted.paymentId._id, {
      transactionId: transId,
      amountPaid: amount,
      paidDate: responseTime,
      notes: orderInfo,
    }, session);

    const paymentDto = ModelDto.new(PaymentDto, updatedPayment);
    return ApiResponse.success(paymentDto);
  });
};

export const returnPaymentVnPayController = async (req, res) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { vnp_ResponseCode, vnp_TxnRef, vnp_PayDate, vnp_Amount, vnp_TransactionNo, vnp_OrderInfo } = req.query;

    if (vnp_ResponseCode !== '00') {
      // await updateOrderByIdService(vnp_TxnRef, {
      //   status: ORDERS_STATUS.CANCELLED,
      // });
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Payment false' });
    }

    const orderExisted = await getOrderByIdService(vnp_TxnRef);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    const updatedPayment = await updatePaymentByIdService(orderExisted.paymentId._id, {
      transactionId: vnp_TransactionNo,
      amountPaid: vnp_Amount / 100,
      paidDate: vnp_PayDate,
      notes: vnp_OrderInfo,
    }, session);

    const paymentDto = ModelDto.new(PaymentDto, updatedPayment);
    return ApiResponse.success(paymentDto);
  });
};

export const returnPaymentCodController = async (req, res) => {
  return {
    statusCode: HttpStatus.OK,
    message: 'Payment Cod successfully',
    data: {},
  };
};
