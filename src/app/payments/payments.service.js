import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { addOrderStatusHistoryByIdRepository, getOrderByIdRepository } from '#src/app/orders/orders.repository';
import { Assert } from '#src/core/assert/Assert';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';
import { PAYMENT_STATUS } from '#src/app/payments/payments.constant';
import { increaseProductVariantsQuantityByOrderRepository } from '#src/app/product-variants/product-variants.repository';
import { updatePaymentByIdRepository } from '#src/app/payments/payments.repository';
import { ORDER_STATUS } from '#src/app/orders/orders.constant';

/**
 * Return Payment Momo
 * @param {ReturnPaymentMoMoDto} payload
 * @returns
 */
export const returnPaymentMoMoService = async (payload) => {
  return TransactionalServiceWrapper.execute(async (session) => {
    const { orderId, resultCode, amount, transId, responseTime } = payload;

    // Validation
    const orderExisted = await getOrderByIdRepository(orderId);
    Assert.isTrue(
      orderExisted,
      HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Order not found' }),
    );

    const isSuccess = resultCode == 0;
    const paymentUpdateData = isSuccess
      ? { status: PAYMENT_STATUS.PAID, transactionId: transId, amountPaid: amount, paidDate: responseTime }
      : { status: PAYMENT_STATUS.CANCELLED };

    // Update quantity of product variants
    if (!isSuccess) {
      await increaseProductVariantsQuantityByOrderRepository(
        orderExisted.orderDetails.map((item) => ({ quantity: item.quantity, variantId: item.variant._id })),
        session,
      );
    }

    await addOrderStatusHistoryByIdRepository(
      orderExisted._id,
      isSuccess ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.CANCELLED,
      null,
      session,
    );

    return await updatePaymentByIdRepository(orderExisted.payment._id, paymentUpdateData, session);
  });
};
