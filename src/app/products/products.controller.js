import { HttpException } from "#src/core/exception/http-exception";

import {
  getAllProductsService,
  getProductByIdService,
  updateProductByIdService,
  removeProductByIdService,
  checkExistProductNameService,
  countAllProductsService,
  newProductService,
} from "#src/app/products/products.service";
import {
  getOptionByIdService
} from "#src/app/options/options.service";
import {
  newProductVariantsService,
  removeProductVariantsByProductIdService,
  saveProductVariantsService,
} from "#src/app/product-variants/product-variants.service";
import { Code } from "#src/core/code/Code";
import { ProductDto } from "#src/app/products/dtos/product.dto";
import { GetProductDto } from "#src/app/products/dtos/get-product.dto";
import { ApiResponse } from "#src/core/api/ApiResponse";
import { ModelDto } from "#src/core/dto/ModelDto";
import { getCategoryByIdService } from "#src/app/categories/categories.service";
import {
  uniqueProductVariants
} from "#src/utils/object.util";
import { TransactionalServiceWrapper } from "#src/core/transaction/TransactionalServiceWrapper";

export const createProductController = async (req) => {
  return await TransactionalServiceWrapper.execute(async (session) => {

    let { name, category, subCategory, productVariants } = req.body;
    delete req.body.productVariants;

    const isExistProductName = await checkExistProductNameService(name);
    if (isExistProductName) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: "Product name already exist" });
    }

    const isExistCategory = await getCategoryByIdService(category);
    if (!isExistCategory) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Category not found" });
    }

    if (subCategory) {
      const isExistSubCategory = await getCategoryByIdService(subCategory);
      if (!isExistSubCategory) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Sub category not found" });
      }
    }

    const newProduct = newProductService(req.body)
    productVariants = uniqueProductVariants(productVariants);

    const productVariantsInstance = await Promise.all(productVariants.map(async (productVariant) => {
      const { variantValues, quantity, price, sku, image } = productVariant;

      const productVariantInstance = newProductVariantsService({
        quantity,
        price,
        sku,
        product: newProduct._id
      })

      await Promise.all(
        variantValues.map(async (variantValue) => {
          const option = await getOptionByIdService(variantValue.option, { _id: variantValue.optionValue });
          if (!option) {
            throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Option or Option value not found" });
          }
        })
      )

      productVariantInstance.variantValues = variantValues;
      return productVariantInstance;
    }))

    const createdProductVariants = await saveProductVariantsService(productVariantsInstance)

    newProduct.productVariants = createdProductVariants.map((variant) => variant._id);

    const product = await newProduct.save({ session });

    const productDto = ModelDto.new(ProductDto, product);
    return ApiResponse.success(productDto);
  })
};

export const getAllProductsController = async (req) => {
  const { keyword, category, limit, page, sortBy, sortOrder } = req.query;

  const filterOptions = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
    ],
    ...(category ? { category } : {}),
  };

  const totalCount = await countAllProductsService(filterOptions);
  const products = await getAllProductsService({
    filters: filterOptions,
    page,
    limit,
    sortBy,
    sortOrder
  });

  const productsDto = ModelDto.newList(ProductDto, products);
  return ApiResponse.success({ totalCount, list: productsDto });
};

export const getProductByIdController = async (req) => {
  const { productId } = req.params;
  const existProduct = await getProductByIdService(productId);

  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
  }

  const productDto = ModelDto.new(GetProductDto, existProduct);
  return ApiResponse.success(productDto);
};

export const updateProductByIdController = async (req) => {
  return await TransactionalServiceWrapper.execute(async (session) => {
    const { productId } = req.params;
    const existProduct = await getProductByIdService(productId, "_id");
    if (!existProduct) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
    }

    let { name, category, productVariants, subCategory } = req.body;
    delete req.body.productVariants;

    const isExistProductName = await checkExistProductNameService(name, existProduct._id);
    if (isExistProductName) {
      throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: "Product name already exist" });
    }

    const isExistCategory = await getCategoryByIdService(category);
    if (!isExistCategory) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Category not found" });
    }

    if (subCategory) {
      const isExistSubCategory = await getCategoryByIdService(subCategory);
      if (!isExistSubCategory) {
        throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Sub category not found" });
      }
    }

    productVariants = uniqueProductVariants(productVariants);

    await removeProductVariantsByProductIdService(existProduct._id, session)

    const productVariantsInstance = await Promise.all(productVariants.map(async (productVariant) => {
      const { variantValues, quantity, price, sku, image } = productVariant;

      const productVariantInstance = newProductVariantsService({
        quantity,
        price,
        sku,
        product: existProduct._id
      })

      await Promise.all(
        variantValues.map(async (variantValue) => {
          const option = await getOptionByIdService(variantValue.option, { _id: variantValue.optionValue });
          if (!option) {
            throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Option or Option value not found" });
          }
        })
      )

      productVariantInstance.variantValues = variantValues;
      return productVariantInstance;
    }))

    const createdProductVariants = await saveProductVariantsService(productVariantsInstance)

    const productVariantIds = createdProductVariants.map((variant) => variant._id);
    const updatedProduct = await updateProductByIdService(existProduct._id, {
      ...req.body, productVariants: productVariantIds
    }, session);


    const productDto = ModelDto.new(ProductDto, updatedProduct);
    return ApiResponse.success(productDto);
  })
};

export const removeProductByIdController = async (req) => {
  const { productId } = req.params;
  const existProduct = await getProductByIdService(productId, "_id");

  if (!existProduct) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: "Product not found" });
  }

  await removeProductByIdService(productId);

  return ApiResponse.success({ id: existProduct._id });
};

export const isExistProductNameController = async (req) => {
  const { name } = req.body;
  const isExistName = await checkExistProductNameService(name);

  return ApiResponse.success(isExistName);
};