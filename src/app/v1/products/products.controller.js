import { ProductVariantModel } from '#src/app/v1/products/product-variants.model';
import { ProductModel } from '#src/app/v1/products/product.model';

export const createProductController = async (req, res) => {
  const newProduct = await ProductModel.create(req.body);
  return newProduct;
};

export const createProductVariantController = async (req, res) => {
  const newVariantProduct = await ProductVariantModel.create(req.body);
  return newVariantProduct;
};
