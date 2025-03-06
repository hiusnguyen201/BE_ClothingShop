import { ProductModel } from "#src/modules/producuts/product.model";

export const getProductByIdService = async ({ productId }) => {
  const product = await ProductModel.findOne({ productId });
  console.log(product, "product");
  return product;
};
