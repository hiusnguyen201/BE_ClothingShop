import { getOrderDetailsByOrderIdService } from "#src/app/order-details/order-details.service";
import { newOrderStatusHistoryService } from "#src/app/order-status-history/order-status-history.service";
import { updateOrderStatusByIdService } from "#src/app/orders/orders.service";
import { getProductVariantByIdService, updateProductVariantQuantityByIdService } from "#src/app/product-variants/product-variants.service";

export const calculateDiscount = (price, amount, isFixed) => {
    if (isFixed) {
        return price * (1 - amount / 100);
    }
    return price - amount;
}

export const updateOrderStatusUtil = async (orderId, newStatus, session) => {
    const newOrderHistory = newOrderStatusHistoryService({
        status: newStatus,
        orderId: orderId,
        // assignedTo: id,,
    });
    await newOrderHistory.save({ session });
    await updateOrderStatusByIdService(orderId, newStatus, newOrderHistory._id, session);
    return;
}

export const updateCancelOrderQuantityProductUtil = async (orderId, session) => {
    const orderDetails = await getOrderDetailsByOrderIdService(orderId);

    await Promise.all(
        orderDetails.map(async (orderDetail) => {
            const productVariant = await getProductVariantByIdService(orderDetail.variantId._id, "_id quantity");
            if (productVariant) {
                await updateProductVariantQuantityByIdService(productVariant._id, productVariant.quantity + orderDetail.quantity, session);
            }
        })
    )
    return;
}