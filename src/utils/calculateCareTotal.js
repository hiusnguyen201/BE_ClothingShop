import { getVariantProductByIdService } from '#src/app/v1/products/product.service';
import { getVoucherByIdService } from '#src/app/v1/vouchers/vouchers.service';
import { NotFoundException } from '#src/core/exception/http-exception';

export const calculateCartTotal = async (productVariantIds, voucherId) => {
  let subTotal = 0;
  let totalQuantity = 0;
  let processedVariants = [];
  let shippingFee = 0;

  for (const item of productVariantIds) {
    const productVariants = await getVariantProductByIdService(item.variantId);
    if (!productVariants || productVariants.length === 0) {
      throw new NotFoundException(`Product variant not found`);
    }

    for (const variant of productVariants) {
      const unitPrice = variant.price * variant.quantity - (variant.discount || 0);
      subTotal += unitPrice;
      totalQuantity += variant.quantity;

      processedVariants.push({
        name: variant.productId.map((item) => item.name).join(', '),
        quantity: variant.quantity,
        unitPrice: variant.price,
        discount: variant.discount || 0,
        sku: variant.sku,
      });
    }
  }

  const voucherExisted = await getVoucherByIdService(voucherId);

  let discountVoucher = 0;

  if (!voucherExisted) {
    discountVoucher = 0;
  } else {
    if (voucherExisted.isFixed) {
      discountVoucher = voucherExisted.discount;
    } else {
      discountVoucher = (subTotal * voucherExisted.discount) / 100;
    }
  }

  //fee

  const total = subTotal + shippingFee - discountVoucher;
  return { subTotal, total, totalQuantity, processedVariants };
};
