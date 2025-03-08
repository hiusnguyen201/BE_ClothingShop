import { CURRENT_TIME, ORDERS_STATUS, PAYMENT_METHOD } from '#src/core/constant';
import { BadRequestException, NotFoundException } from '#src/core/exception/http-exception';
import { getOrderByIdService, updateOrderByIdService } from '#src/app/v1/orders/orders.service';
import HttpStatus from 'http-status-codes';
import { createPaymentService } from '#src/app/v1/payments/payments.service';

export const createPaymentController = async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  const orderExisted = await getOrderByIdService(orderId);
  if (!orderExisted) {
    throw new NotFoundException('Order not found');
  }

  let transactionId = null;
  let notes = '';
  switch (paymentMethod) {
    case PAYMENT_METHOD.MOMO:
      transactionId = `${PAYMENT_METHOD.MOMO}_${orderExisted._id}_${CURRENT_TIME}`;
      notes = `Payment via ${PAYMENT_METHOD.MOMO}`;
      break;

    case PAYMENT_METHOD.VNPAY:
      transactionId = `${PAYMENT_METHOD.VNPAY}_${orderExisted._id}_${CURRENT_TIME}`;
      notes = `Payment via ${PAYMENT_METHOD.MOMO}`;
      break;

    case PAYMENT_METHOD.COD:
      transactionId = `${PAYMENT_METHOD.COD}_${orderExisted._id}_${CURRENT_TIME}`;
      notes = 'Cash on Delivery';
      break;

    default:
      throw new BadRequestException('Invalid payment method');
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
    });
  }

  return {
    statusCode: HttpStatus.CREATED,
    message: 'Create order successfully',
    data: newPayment,
  };
};
