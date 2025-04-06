// import { getCustomerByIdService } from '#src/app/customers/customers.service';
// import { calculateOrderTotalService, createOrderService } from '#src/app/orders/orders.service';
// import { getVariantProductByIdService } from '#src/app/products/product.service';
// import { getShippingAddressByIdService } from '#src/app/shipping-address/shipping-address.service';
// import { getVoucherByIdService } from '#src/app/vouchers/vouchers.service';
// import { Code } from '#src/core/code/Code';
// import { HttpException } from '#src/core/exception/http-exception';
// import moment from 'moment-timezone';
// import { randomCodeOrder } from '#src/utils/string.util';
// import { createOrderDetailService } from '#src/app/orderDetails/order-details.service';
// import { ORDERS_STATUS } from '#src/core/constant';

// export const handleCreateOrder = async (req, session) => {
//     const { customerId, voucherId, shippingAddressId, productVariants } = req.body;

//     const customerExisted = await getCustomerByIdService(customerId);
//     if (!customerExisted) {
//         throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Customer not found' });
//     }

//     const shippingAddressExisted = await getShippingAddressByIdService(shippingAddressId);
//     if (!shippingAddressExisted) {
//         throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Address not found' });
//     }


//     const variantIds = productVariants.map((productVariant) => productVariant.variantId);
//     const productVariantsExited = await getVariantProductByIdService(variantIds);

//     if (!productVariantsExited && productVariantsExited.length === 0) {
//         throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
//     }

//     const productVariantDetails = productVariants.map((item) => {
//         const variant = productVariantsExited.find((v) => v._id.toString() === item.variantId);
//         return {
//             variantId: variant._id,
//             productId: variant.product,
//             unitPrice: variant.price,
//             sku: variant.sku,
//             quantity: item.quantity,
//         };
//     });

//     const voucherExisted = await getVoucherByIdService(voucherId);
//     const calculateOrderDetails = await calculateOrderTotalService(productVariantDetails, voucherExisted);

//     const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
//     const code = randomCodeOrder(14);

//     const createOrderRequirement = {
//         code,
//         provinceName: req.body.provinceName || shippingAddressExisted.province,
//         districtName: req.body.districtName || shippingAddressExisted.district,
//         wardName: req.body.wardName || shippingAddressExisted.ward,
//         address: req.body.address || shippingAddressExisted.address,
//         customerId: req.body.customerId || customerExisted._id,
//         customerName: shippingAddressExisted.customerName || customerExisted.name,
//         customerEmail: customerExisted.email,
//         customerPhone: shippingAddressExisted.customerPhone || customerExisted.phone,
//         // shippingAddressId: req.body.shippingAddressId || shippingAddressExisted._id,
//         quantity: calculateOrderDetails.totalQuantity,
//         subTotal: calculateOrderDetails.subTotal,
//         shippingFee: 0,
//         orderDate: currentDate,
//         total: calculateOrderDetails.total,
//         isPaid: false,
//         status: ORDERS_STATUS.PENDING,
//         voucherId: voucherId || null,
//     };

//     const newOrder = await createOrderService(createOrderRequirement, session);
//     const newOrderDetails = calculateOrderDetails.orderDetails.map((item) => ({
//         ...item,
//         orderId: newOrder._id,
//     }));

//     await createOrderDetailService(newOrderDetails, session);

//     return { newOrder, calculateOrderDetails };
// };


export const calculateDiscount = (price, amount, isFixed) => {
    if (isFixed) {
        return price * (1 - amount / 100);
    }
    return price - amount;
}