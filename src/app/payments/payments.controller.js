import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { PaymentDto } from '#src/app/payments/dtos/payment.dto';
import { PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import { returnPaymentMoMoService } from '#src/app/payments/payments.service';
import { ReturnPaymentMoMoDto } from '#src/app/payments/dtos/return-payment-momo.dto';

export const returnPaymentMoMoController = async (req) => {
  const adapter = await validateSchema(ReturnPaymentMoMoDto, req.body);

  const payment = await returnPaymentMoMoService(adapter);

  const paymentDto = ModelDto.new(PaymentDto, payment);
  return ApiResponse.success(
    paymentDto,
    payment.status === PAYMENT_STATUS.PAID ? 'Payment successful' : 'The payment was cancelled by the customer',
  );
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
