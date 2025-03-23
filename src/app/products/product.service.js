import { ProductModel } from '#src/app/products/product.model';
import { ProductVariantModel } from '#src/app/products/product-variants.model';

export const getProductByIdService = async ({ productId }) => {
  return await ProductModel.findOne({ productId });
};

export const getVariantProductByIdService = async (productVariantIds) => {
  return await ProductVariantModel.find({ _id: { $in: productVariantIds } }).populate({
    path: 'productId',
    model: 'Product',
  });
};
