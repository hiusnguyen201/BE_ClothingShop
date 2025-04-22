import { ORDER_STATUS } from '#src/app/orders/orders.constant';
import { HttpException } from '#src/core/exception/http-exception';
import { addOrderStatusHistoryByIdService, getOrderByIdService } from '#src/app/orders/orders.service';
import { updatePaymentByIdService } from '#src/app/payments/payments.service';
import { Code } from '#src/core/code/Code';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PaymentDto } from '#src/app/payments/dtos/payment.dto';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import { increaseProductVariantsQuantityByOrderService } from '#src/app/product-variants/product-variants.service';

export const returnPaymentMoMoController = async (req) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId, resultCode, amount, transId, responseTime } = req.body;

    // Validation
    const orderExisted = await getOrderByIdService(orderId);
    if (!orderExisted) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' });
    }

    const isSuccess = resultCode == 0;
    const paymentUpdateData = isSuccess
      ? { status: PAYMENT_STATUS.PAID, transactionId: transId, amountPaid: amount, paidDate: responseTime }
      : { status: PAYMENT_STATUS.CANCELLED };

    // Update quantity of product variants
    if (!isSuccess) {
      await increaseProductVariantsQuantityByOrderService(
        orderExisted.orderDetails.map((item) => ({ quantity: item.quantity, variantId: item.variant._id })),
        session,
      );
    }

    await addOrderStatusHistoryByIdService(
      orderExisted._id,
      isSuccess ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.CANCELLED,
      null,
      session,
    );

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
//       //   status: ORDER_STATUS.CANCELLED,
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
