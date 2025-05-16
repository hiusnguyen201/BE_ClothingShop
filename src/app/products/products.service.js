import { HttpException } from '#src/core/exception/http-exception';
import {
  getAndCountProductsRepository,
  getProductByIdRepository,
  updateProductInfoByIdRepository,
  removeProductByIdRepository,
  checkExistProductNameRepository,
  createProductRepository,
  updateProductVariantsByIdRepository,
} from '#src/app/products/products.repository';
import { getOptionByIdRepository } from '#src/app/options/options.repository';
import {
  newProductVariantsRepository,
  removeProductVariantsByProductIdRepository,
  saveProductVariantsRepository,
} from '#src/app/product-variants/product-variants.repository';
import { Code } from '#src/core/code/Code';
import { getCategoryByIdRepository } from '#src/app/categories/categories.repository';
import { makeUniqueProductVariants } from '#src/utils/object.util';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { PRODUCT_STATUS } from '#src/app/products/products.constant';
import {
  deleteProductFromCache,
  getProductFromCache,
  getProductsFromCache,
  setProductToCache,
  setProductsToCache,
} from '#src/app/products/products.cache';
import { Assert } from '#src/core/assert/Assert';

export const checkExistProductNameService = async (payload) => {
  return await checkExistProductNameRepository(payload.name, payload.skipId);
};

export const createProductService = async (payload) => {
  const isExistProductName = await checkExistProductNameRepository(payload.name);
  Assert.isFalse(
    isExistProductName,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Product name already exist' }),
  );

  const isExistCategory = await getCategoryByIdRepository(payload.category);
  Assert.isTrue(
    isExistCategory,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' }),
  );

  if (payload.subCategory) {
    const isExistSubCategory = await getCategoryByIdRepository(payload.subCategory);
    Assert.isTrue(
      isExistSubCategory,
      HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Subcategory not found' }),
    );
  }

  if (payload.thumbnail) {
    const result = await uploadImageBufferService({ buffer: payload.thumbnail, folderName: 'product-thumbnails' });
    payload.thumbnail = result.url;
  }

  const newProduct = await createProductRepository(payload);

  // Clear cache
  await deleteProductFromCache(newProduct._id);

  return newProduct;
};

export const getAllProductsService = async (payload) => {
  const filters = {
    $or: [{ name: { $regex: payload.keyword || '', $options: 'i' } }],
    ...(payload.status && { status: payload.status }),
    ...(payload.categoryIds && {
      category: {
        $in: payload.categoryIds,
      },
    }),
  };

  const cached = await getProductsFromCache(payload);
  if (cached && Array.isArray(cached) && cached.length === 2 && cached[0] > 0) return cached;

  const skip = (payload.page - 1) * payload.limit;
  const [totalCount, products] = await getAndCountProductsRepository(
    filters,
    skip,
    payload.limit,
    payload.sortBy,
    payload.sortOrder,
  );

  await setProductsToCache(payload, totalCount, products);

  return [totalCount, products];
};

export const getProductByIdOrFailService = async (payload) => {
  const cached = await getProductFromCache(payload.productId);
  if (cached) return cached;

  const product = await getProductByIdRepository(payload.productId);
  Assert.isTrue(product, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' }));

  await setProductToCache(payload.productId, product);

  return product;
};

export const updateProductInfoOrFailService = async (payload) => {
  const existProduct = await getProductByIdRepository(payload.productId);
  Assert.isTrue(
    existProduct,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' }),
  );

  Assert.isFalse(
    existProduct.productVariants.length === 0 && payload.status === PRODUCT_STATUS.ACTIVE,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Cannot activate a product without variants' }),
  );

  const isExistProductName = await checkExistProductNameRepository(payload.name, existProduct._id);
  Assert.isFalse(
    isExistProductName,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Product name already exist' }),
  );

  const isExistCategory = await getCategoryByIdRepository(payload.category);
  Assert.isTrue(
    isExistCategory,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' }),
  );

  if (payload.subCategory) {
    const isExistSubCategory = await getCategoryByIdRepository(payload.subCategory);
    Assert.isTrue(
      isExistSubCategory,
      HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Subcategory not found' }),
    );
  }

  if (payload.thumbnail instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: payload.thumbnail, folderName: 'product-thumbnails' });
    payload.thumbnail = result.url;
  }

  await updateProductInfoByIdRepository(existProduct._id, payload);

  const updatedProduct = await getProductByIdRepository(existProduct._id);

  // Clear cache
  await deleteProductFromCache(existProduct._id);

  return updatedProduct;
};

export const updateProductVariantsService = async (payload) => {
  // Validation
  const existProduct = await getProductByIdRepository(payload.productId);
  Assert.isTrue(
    existProduct,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' }),
  );

  // Logic
  await TransactionalServiceWrapper.execute(async (session) => {
    await removeProductVariantsByProductIdRepository(existProduct._id, session);

    // Create List Product Option
    const productOptionsInstance = await Promise.all(
      payload.options.map(async (opt) => {
        const { option: optionName, selectedValues } = opt;

        const option = await getOptionByIdRepository(optionName, { valueName: { $in: selectedValues } });

        Assert.isTrue(
          option,
          HttpException.new({
            code: Code.RESOURCE_NOT_FOUND,
            overrideMessage: 'Option or Option value not found',
          }),
        );

        return { option: option._id, optionValues: option.optionValues.filter(Boolean).map((item) => item._id) };
      }),
    );

    // Create List Product Variant
    const uniqueProductVariants = makeUniqueProductVariants(payload.productVariants);
    const productVariantsInstance = await Promise.all(
      uniqueProductVariants.map(async (productVariant) => {
        const { variantValues, quantity, price, sku } = productVariant;

        const productVariantInstance = newProductVariantsRepository({
          quantity,
          price,
          sku,
          product: existProduct._id,
        });

        await Promise.all(
          variantValues.map(async (variantValue, index) => {
            const option = await getOptionByIdRepository(variantValue.option, { valueName: variantValue.optionValue });

            Assert.isTrue(
              option,
              HttpException.new({
                code: Code.RESOURCE_NOT_FOUND,
                overrideMessage: 'Option or Option value not found',
              }),
            );

            variantValues[index].option = option._id;
            variantValues[index].optionValue = option.optionValues[0]._id;
          }),
        );

        productVariantInstance.variantValues = variantValues;

        return productVariantInstance;
      }),
    );
    // Save List Product Variant
    const createdProductVariants = await saveProductVariantsRepository(productVariantsInstance);

    // Update Product
    const productVariantIds = createdProductVariants.map((variant) => variant._id);
    await updateProductVariantsByIdRepository(
      existProduct._id,
      {
        productOptions: productOptionsInstance,
        productVariants: productVariantIds,
      },
      session,
    );
  });

  // Clear cache
  await deleteProductFromCache(existProduct._id);
};

export const removeProductByIdService = async (payload) => {
  const existProduct = await getProductByIdRepository(payload.productId, '_id status');
  Assert.isTrue(
    existProduct,
    HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' }),
  );

  Assert.isFalse(
    existProduct.status === PRODUCT_STATUS.ACTIVE,
    HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Cannot remove active product' }),
  );

  await removeProductByIdRepository(existProduct._id);

  // Clear cache
  await deleteProductFromCache(existProduct._id);

  return { id: existProduct._id };
};
