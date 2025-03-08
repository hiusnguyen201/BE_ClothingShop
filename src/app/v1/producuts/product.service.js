import { ProductModel } from '#src/app/v1/producuts/product.model';

export const getProductByIdService = async ({ productId }) => {
  const product = await ProductModel.findOne({ productId });
  console.log(product, 'product');
  return product;
};
