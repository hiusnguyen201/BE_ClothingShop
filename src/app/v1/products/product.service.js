import { ProductModel } from '#src/app/v1/products/product.model';
import { ProductVariantModel } from '#src/app/v1/products/product-variants.model';

export const getProductByIdService = async ({ productId }) => {
  const product = await ProductModel.findOne({ productId });
  console.log(product, 'product');
  return product;
};

export const getVariantProductByIdService = async (variantproductId) => {
  const variantProduct = await ProductVariantModel.find({ _id: variantproductId });
  // console.log(variantProduct, 'variant product');
  return variantProduct;
};
