import { ProductModel } from '#src/app/products/product.model';
import { ProductVariantModel } from '#src/app/products/product-variants.model';

export const getProductByIdService = async ({ productId }) => {
  const product = await ProductModel.findOne({ productId });
  return product;
};

export const getVariantProductByIdService = async (variantProductId) => {
  const variantProduct = await ProductVariantModel.find({ _id: variantProductId }).populate({
    path: 'productId',
    model: 'Product',
  });
  return variantProduct;
};
