import { ORDERS_STATUS } from '#src/app/orders/orders.constant';
import { HttpException } from '#src/core/exception/http-exception';
import { addOrderStatusHistoryByIdService, getOrderByIdService } from '#src/app/orders/orders.service';
import { updatePaymentByIdService } from '#src/app/payments/payments.service';
import { Code } from '#src/core/code/Code';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PaymentDto } from '#src/app/payments/dtos/payment.dto';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { createOrderStatusHistoryService } from '#src/app/order-status-history/order-status-history.service';
import { PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import { updateProductVariantByIdService } from '#src/app/product-variants/product-variants.service';

export const returnPaymentMoMoController = async (req) => {
  const { orderId, resultCode, amount, transId, responseTime } = req.body;

  // Validation
  const orderExisted = await getOrderByIdService(orderId);
  if (!orderExisted) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
  }

  return TransactionalServiceWrapper.execute(async (session) => {
    const isSuccess = resultCode == 0;
    const orderHistoryUpdateData = { order: orderExisted._id };
    const paymentUpdateData = {};

    if (isSuccess) {
      orderHistoryUpdateData.status = ORDERS_STATUS.CONFIRMED;
      paymentUpdateData.status = PAYMENT_STATUS.PAID;
      paymentUpdateData.transactionId = transId;
      paymentUpdateData.amountPaid = amount;
      paymentUpdateData.paidDate = responseTime;
    } else {
      orderHistoryUpdateData.status = ORDERS_STATUS.CANCELLED;
      paymentUpdateData.status = PAYMENT_STATUS.CANCELLED;

      // Update quantity of product variants
      await Promise.all(
        orderExisted.orderDetails.map(async (item) => {
          await updateProductVariantByIdService(
            item.variant._id,
            { quantity: item.variant.quantity + item.quantity },
            session,
          );
        }),
      );
    }

    const createdStatus = await createOrderStatusHistoryService(orderHistoryUpdateData, session);

    await addOrderStatusHistoryByIdService(orderExisted._id, createdStatus, session);

    const updatedPayment = await updatePaymentByIdService(orderExisted.payment._id, paymentUpdateData, session);

    const paymentDto = ModelDto.new(PaymentDto, updatedPayment);
    return ApiResponse.success(
      paymentDto,
      isSuccess ? 'Payment successful' : 'The payment was cancelled by the customer',
    );
  });
};

// export const returnPaymentVnPayController = async (req) => {
//   return TransactionalServiceWrapper.execute(async (session) => {
//     const { vnp_ResponseCode, vnp_TxnRef, vnp_PayDate, vnp_Amount, vnp_TransactionNo, vnp_OrderInfo } = req.query;

//     if (vnp_ResponseCode !== '00') {
//       // await updateOrderByIdService(vnp_TxnRef, {
//       //   status: ORDERS_STATUS.CANCELLED,
//       // });
//       throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Payment false' });
//     }

//     const orderExisted = await getOrderByIdService(vnp_TxnRef);
//     if (!orderExisted) {
//       throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
//     }

//     const updatedPayment = await updatePaymentByIdService(
//       orderExisted.payment._id,
//       {
//         transactionId: vnp_TransactionNo,
//         amountPaid: vnp_Amount / 100,
//         paidDate: vnp_PayDate,
//         notes: vnp_OrderInfo,
//       },
//       session,
//     );

//     const paymentDto = ModelDto.new(PaymentDto, updatedPayment);
//     return ApiResponse.success(paymentDto);
//   });
// };
