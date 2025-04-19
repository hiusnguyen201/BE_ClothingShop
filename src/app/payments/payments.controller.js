import { ORDERS_STATUS } from '#src/app/orders/orders.constant';
import { HttpException } from '#src/core/exception/http-exception';
import { getOrderByIdService, updateOrderStatusByIdService } from '#src/app/orders/orders.service';
import { updatePaymentByIdService } from '#src/app/payments/payments.service';
import { Code } from '#src/core/code/Code';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PaymentDto } from '#src/app/payments/dtos/payment.dto';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import {
  duplicateCheckOrderStatusHistoryService,
  newOrderStatusHistoryService,
} from '#src/app/order-status-history/order-status-history.service';
import { updateOrderStatusUtil } from '#src/utils/handle-create-order';

export const returnPaymentMoMoController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId, resultCode, amount, transId, orderInfo, responseTime } = req.query;

    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    if (resultCode != 0) {
      await updateOrderStatusUtil(orderExisted._id, ORDERS_STATUS.CANCELLED, session);
      throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Payment cancel' });
    }

    const newOrderStatus = ORDERS_STATUS.CONFIRM;

    const existingOrderStatusHistory = await duplicateCheckOrderStatusHistoryService(orderId, newOrderStatus);
    if (existingOrderStatusHistory) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Order history status already exists' });
    }

    const updatedPayment = await updatePaymentByIdService(
      orderExisted.payment._id,
      {
        transactionId: transId,
        amountPaid: amount,
        paidDate: responseTime,
        notes: orderInfo,
      },
      session,
    );

    const newOrderHistory = newOrderStatusHistoryService({
      status: newOrderStatus,
      order: orderExisted._id,
      // assignedTo: id,,
    });
    await newOrderHistory.save({ session });

    await updateOrderStatusByIdService(orderExisted._id, newOrderStatus, newOrderHistory._id, session);

    const paymentDto = ModelDto.new(PaymentDto, updatedPayment);
    return ApiResponse.success(paymentDto);
  });
};

export const returnPaymentVnPayController = async (req) => {
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

    const updatedPayment = await updatePaymentByIdService(
      orderExisted.payment._id,
      {
        transactionId: vnp_TransactionNo,
        amountPaid: vnp_Amount / 100,
        paidDate: vnp_PayDate,
        notes: vnp_OrderInfo,
      },
      session,
    );

    const paymentDto = ModelDto.new(PaymentDto, updatedPayment);
    return ApiResponse.success(paymentDto);
  });
};

// export const returnPaymentCodController = async (req) => {
//   return TransactionalServiceWrapper.execute(async (session) => {
//     const { orderId, resultCode, amount, transId, orderInfo, responseTime } = req.query;

//     const orderExisted = await getOrderByIdService(orderId);
//     if (!orderExisted) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
//     }

//     if (resultCode == false) {
//       await updateOrderByIdService(orderExisted._id, {
//         status: ORDERS_STATUS.CANCELLED,
//       }, session);
//     }

//     const updatedPayment = await updatePaymentByIdService(orderExisted.paymentId._id, {
//       transactionId: transId,
//       amountPaid: amount,
//       paidDate: responseTime,
//       notes: orderInfo,
//     }, session);

//     const paymentDto = ModelDto.new(PaymentDto, updatedPayment);
//     return ApiResponse.success(paymentDto);
//   });
// };
