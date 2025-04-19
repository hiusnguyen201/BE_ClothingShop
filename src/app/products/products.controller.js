import { HttpException } from '#src/core/exception/http-exception';
import {
  getAllProductsService,
  getProductByIdService,
  updateProductInfoByIdService,
  removeProductByIdService,
  checkExistProductNameService,
  countAllProductsService,
  createProductService,
  updateProductVariantsByIdService,
} from '#src/app/products/products.service';
import { getOptionByIdService } from '#src/app/options/options.service';
import {
  newProductVariantsService,
  removeProductVariantsByProductIdService,
  saveProductVariantsService,
} from '#src/app/product-variants/product-variants.service';
import { Code } from '#src/core/code/Code';
import { ProductDto } from '#src/app/products/dtos/product.dto';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { ModelDto } from '#src/core/dto/ModelDto';
import { getCategoryByIdService } from '#src/app/categories/categories.service';
import { makeUniqueProductVariants } from '#src/utils/object.util';
import { TransactionalServiceWrapper } from '#src/core/transaction/TransactionalServiceWrapper';
import { uploadImageBufferService } from '#src/modules/cloudinary/cloudinary.service';
import { PRODUCT_STATUS } from '#src/app/products/products.constant';

export const createProductController = async (req) => {
  const { name, category, subCategory, thumbnail } = req.body;

  const isExistProductName = await checkExistProductNameService(name);
  if (isExistProductName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Product name already exist' });
  }

  const isExistCategory = await getCategoryByIdService(category);
  if (!isExistCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (subCategory) {
    const isExistSubCategory = await getCategoryByIdService(subCategory);
    if (!isExistSubCategory) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Subcategory not found' });
    }
  }

  if (thumbnail instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: thumbnail, folderName: 'product-thumbnails' });
    req.body.thumbnail = result.url;
  }

  const newProduct = await createProductService(req.body);

  const productDto = ModelDto.new(ProductDto, newProduct);
  return ApiResponse.success(productDto);
};

export const getAllProductsController = async (req) => {
  const { keyword, category, limit, page, sortBy, sortOrder, status } = req.query;

  const filterOptions = {
    $or: [{ name: { $regex: keyword, $options: 'i' } }],
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
  };

  const totalCount = await countAllProductsService(filterOptions);
  const products = await getAllProductsService({
    filters: filterOptions,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const productsDto = ModelDto.newList(ProductDto, products);
  return ApiResponse.success({ totalCount, list: productsDto });
};

export const getProductByIdController = async (req) => {
  const { productId } = req.params;
  const existProduct = await getProductByIdService(productId);

  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  const productDto = ModelDto.new(ProductDto, existProduct);
  return ApiResponse.success(productDto);
};

export const updateProductInfoController = async (req) => {
  const { productId } = req.params;
  const existProduct = await getProductByIdService(productId, '_id');
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  const { name, category, subCategory, thumbnail, status } = req.body;

  if (existProduct.productVariants.length === 0 && status === PRODUCT_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Cannot activate a product without variants' });
  }

  const isExistProductName = await checkExistProductNameService(name, existProduct._id);
  if (isExistProductName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Product name already exist' });
  }

  const isExistCategory = await getCategoryByIdService(category);
  if (!isExistCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (subCategory) {
    const isExistSubCategory = await getCategoryByIdService(subCategory);
    if (!isExistSubCategory) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Subcategory not found' });
    }
  }

  if (thumbnail instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: thumbnail, folderName: 'product-thumbnails' });
    req.body.thumbnail = result.url;
  }

  await updateProductInfoByIdService(existProduct._id, req.body);

  const updatedProduct = await getProductByIdService(existProduct._id);

  const productDto = ModelDto.new(ProductDto, updatedProduct);
  return ApiResponse.success(productDto);
};

export const updateProductVariantsController = async (req) => {
  const { productVariants, options } = req.body;
  const { productId } = req.params;

  // Validation
  const existProduct = await getProductByIdService(productId, '_id');
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  // Logic
  await TransactionalServiceWrapper.execute(async (session) => {
    await removeProductVariantsByProductIdService(existProduct._id, session);

    // Create List Product Option
    const productOptionsInstance = await Promise.all(
      options.map(async (opt) => {
        const { option: optionName, selectedValues } = opt;

        const option = await getOptionByIdService(optionName, { valueName: { $in: selectedValues } });
        if (!option) {
          throw HttpException.new({
            code: Code.RESOURCE_NOT_FOUND,
            overrideMessage: 'Option or Option value not found',
          });
        }

        return { option: option._id, optionValues: option.optionValues.filter(Boolean).map((item) => item._id) };
      }),
    );

    // Create List Product Variant
    const uniqueProductVariants = makeUniqueProductVariants(productVariants);
    const productVariantsInstance = await Promise.all(
      uniqueProductVariants.map(async (productVariant) => {
        const { variantValues, quantity, price, sku } = productVariant;

        const productVariantInstance = newProductVariantsService({
          quantity,
          price,
          sku,
          product: existProduct._id,
        });

        await Promise.all(
          variantValues.map(async (variantValue, index) => {
            const option = await getOptionByIdService(variantValue.option, { valueName: variantValue.optionValue });
            if (!option) {
              throw HttpException.new({
                code: Code.RESOURCE_NOT_FOUND,
                overrideMessage: 'Option or Option value not found',
              });
            }

            variantValues[index].option = option._id;
            variantValues[index].optionValue = option.optionValues[0]._id;
          }),
        );

        productVariantInstance.variantValues = variantValues;

        return productVariantInstance;
      }),
    );
    // Save List Product Variant
    const createdProductVariants = await saveProductVariantsService(productVariantsInstance);

    // Update Product
    const productVariantIds = createdProductVariants.map((variant) => variant._id);
    await updateProductVariantsByIdService(
      existProduct._id,
      {
        productOptions: productOptionsInstance,
        productVariants: productVariantIds,
      },
      session,
    );
  });

  // Transform data
  const product = await getProductByIdService(existProduct._id);
  const productDto = ModelDto.new(ProductDto, product);
  return ApiResponse.success(productDto);
};

export const removeProductByIdController = async (req) => {
  const { productId } = req.params;
  const existProduct = await getProductByIdService(productId, '_id status');

  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  if (existProduct.status === PRODUCT_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Cannot remove active product' });
  }

  await removeProductByIdService(productId);

  return ApiResponse.success({ id: existProduct._id });
};

export const isExistProductNameController = async (req) => {
  const { name, skipId } = req.body;

  const isExistName = await checkExistProductNameService(name, skipId);

  return ApiResponse.success(isExistName);
};
