import { HttpException } from '#src/core/exception/http-exception';
import {
  getAndCountProductsService,
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
import { validateSchema } from '#src/core/validations/request.validation';
import { CheckExistProductNameDto } from '#src/app/products/dtos/check-exist-product-name.dto';
import { CreateProductDto } from '#src/app/products/dtos/create-product.dto';
import { UpdateProductInfoDto } from '#src/app/products/dtos/update-product-info.dto';
import { GetListProductDto } from '#src/app/products/dtos/get-list-product.dto';
import { GetProductDto } from '#src/app/products/dtos/get-product.dto';
import { UpdateProductVariantsDto } from '#src/app/products/dtos/update-product-variants.dto';

export const isExistProductNameController = async (req) => {
  const adapter = await validateSchema(CheckExistProductNameDto, req.body);

  const isExistName = await checkExistProductNameService(adapter.name, adapter.skipId);

  return ApiResponse.success(isExistName);
};

export const createProductController = async (req) => {
  const adapter = await validateSchema(CreateProductDto, req.body);

  const isExistProductName = await checkExistProductNameService(adapter.name);
  if (isExistProductName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Product name already exist' });
  }

  const isExistCategory = await getCategoryByIdService(adapter.category);
  if (!isExistCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (adapter.subCategory) {
    const isExistSubCategory = await getCategoryByIdService(adapter.subCategory);
    if (!isExistSubCategory) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Subcategory not found' });
    }
  }

  if (adapter.thumbnail) {
    const result = await uploadImageBufferService({ buffer: adapter.thumbnail, folderName: 'product-thumbnails' });
    adapter.thumbnail = result.url;
  }

  const newProduct = await createProductService(adapter);

  const productDto = ModelDto.new(ProductDto, newProduct);
  return ApiResponse.success(productDto);
};

export const getAllProductsController = async (req) => {
  const adapter = await validateSchema(GetListProductDto, req.query);

  const filters = {
    $or: [{ name: { $regex: adapter.keyword, $options: 'i' } }],
    ...(adapter.status ? { status: adapter.status } : {}),
    ...(adapter.category ? { category: adapter.category } : {}),
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, products] = await getAndCountProductsService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const productsDto = ModelDto.newList(ProductDto, products);
  return ApiResponse.success({ totalCount, list: productsDto });
};

export const getAllProductsByCustomerController = async (req) => {
  const adapter = await validateSchema(GetListProductDto, req.query);

  const filters = {
    status: PRODUCT_STATUS.ACTIVE,
    $or: [{ name: { $regex: adapter.keyword, $options: 'i' } }],
    ...(adapter.category ? { $or: [{ category: adapter.category }, { subCategory: adapter.category }] } : {}),
  };

  const skip = (adapter.page - 1) * adapter.limit;
  const [totalCount, products] = await getAndCountProductsService(
    filters,
    skip,
    adapter.limit,
    adapter.sortBy,
    adapter.sortOrder,
  );

  const productsDto = ModelDto.newList(ProductDto, products);
  return ApiResponse.success({ totalCount, list: productsDto });
};

export const getProductByIdController = async (req) => {
  const adapter = await validateSchema(GetProductDto, req.params);

  const existProduct = await getProductByIdService(adapter.productId);

  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  const productDto = ModelDto.new(ProductDto, existProduct);
  return ApiResponse.success(productDto);
};

export const updateProductInfoController = async (req) => {
  const adapter = await validateSchema(UpdateProductInfoDto, { ...req.params, ...req.body });

  const existProduct = await getProductByIdService(adapter.productId);
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  if (existProduct.productVariants.length === 0 && adapter.status === PRODUCT_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Cannot activate a product without variants' });
  }

  const isExistProductName = await checkExistProductNameService(adapter.name, existProduct._id);
  if (isExistProductName) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Product name already exist' });
  }

  const isExistCategory = await getCategoryByIdService(adapter.category);
  if (!isExistCategory) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Category not found' });
  }

  if (adapter.subCategory) {
    const isExistSubCategory = await getCategoryByIdService(adapter.subCategory);
    if (!isExistSubCategory) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Subcategory not found' });
    }
  }

  if (adapter.thumbnail instanceof Buffer) {
    const result = await uploadImageBufferService({ buffer: adapter.thumbnail, folderName: 'product-thumbnails' });
    adapter.thumbnail = result.url;
  }

  await updateProductInfoByIdService(existProduct._id, adapter);

  const updatedProduct = await getProductByIdService(existProduct._id);

  const productDto = ModelDto.new(ProductDto, updatedProduct);
  return ApiResponse.success(productDto);
};

export const updateProductVariantsController = async (req) => {
  const adapter = await validateSchema(UpdateProductVariantsDto, { ...req.params, ...req.body });

  // Validation
  const existProduct = await getProductByIdService(adapter.productId);
  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  // Logic
  await TransactionalServiceWrapper.execute(async (session) => {
    await removeProductVariantsByProductIdService(existProduct._id, session);

    // Create List Product Option
    const productOptionsInstance = await Promise.all(
      adapter.options.map(async (opt) => {
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
    const uniqueProductVariants = makeUniqueProductVariants(adapter.productVariants);
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
  const adapter = await validateSchema(GetProductDto, req.params);

  const existProduct = await getProductByIdService(adapter.productId, '_id status');

  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product not found' });
  }

  if (existProduct.status === PRODUCT_STATUS.ACTIVE) {
    throw HttpException.new({ code: Code.BAD_REQUEST, overrideMessage: 'Cannot remove active product' });
  }

  await removeProductByIdService(existProduct._id);

  return ApiResponse.success({ id: existProduct._id });
};
