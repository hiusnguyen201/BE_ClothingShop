import { getVariantProductByIdService } from '#src/app/v1/products/product.service';
import { getVoucherByIdService } from '#src/app/v1/vouchers/vouchers.service';
import { NotFoundException } from '#src/core/exception/http-exception';

export const calculateCartTotal = async (productVariantIds, voucherId) => {
  let subTotal = 0;
  let totalQuantity = 0;
  let processedVariants = [];
  let shippingFee = 0;

  // Find nhiều với filter _id nằm trong productVariantIds => Tốn 1 query (viết bên ngoài controller, check ở bên ngoài)
  // Khi mà có mảng productVariants hợp lệ
  // Lặp tính toán

  for (const item of productVariantIds) {
    // Cái này tốn n query dựa theo độ dài của mảng
    const productVariants = await getVariantProductByIdService(item.variantId);
    if (!productVariants || productVariants.length === 0) {
      throw new NotFoundException(`Product variant not found`);
    }

    // Áo màu đen, size xl, có số lượng là 50

    // Nếu mà đúng với 1 query như trên
    for (const variant of productVariants) {
      // Bỏ discount, chỉ còn tính tổng tiền trên từng biến thể
      const totalPrice = variant.price * variant.quantity - (variant.discount || 0);
      subTotal += totalPrice;
      totalQuantity += variant.quantity;

      processedVariants.push({
        name: variant.productId.map((item) => item.name).join(', '), // variant.product.name
        quantity: variant.quantity,
        unitPrice: variant.price,
        discount: variant.discount || 0,
        sku: variant.sku,
        totalPrice,
      });
    }
  }

  const voucherExisted = await getVoucherByIdService(voucherId);

  let discountVoucher = 0;

  if (voucherExisted && voucherExisted.isFixed) {
    discountVoucher = voucherExisted.discount;
  } else if (voucherExisted) {
    discountVoucher = (subTotal * voucherExisted.discount) / 100;
  }

  //fee

  const total = subTotal + shippingFee - discountVoucher;
  return { subTotal, total, totalQuantity, processedVariants };
};
