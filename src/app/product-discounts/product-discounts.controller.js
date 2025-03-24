import {
  HttpException,
} from "#src/core/exception/http-exception";

import {
  createProductDiscountService,
  getAllProductDiscountsService,
  countAllProductDiscountsService,
  getProductDiscountByIdService,
  updateProductDiscountByIdService,
  removeProductDiscountByIdService,
} from "#src/app/product-discounts/product-discounts.service"
import { calculatePagination } from "#src/utils/pagination.util";
import { Code } from "#src/core/code/Code";
import { ApiResponse } from "#src/core/api/ApiResponse";
import { ModelDto } from "#src/core/dto/ModelDto";
import { ProductDiscountDto } from "#src/app/product-discounts/dtos/product-discount.dto";
import {
  getProductVariantByIdService,
  updateProductDiscountByProductVariantIdService
} from "#src/app/product-variants/product-variants.service";

export const createProductDiscountController = async (req) => {
  const { amount, is_fixed, productVariant } = req.body;
  if (is_fixed) {
    if (amount < 1 || amount > 99) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Discounts ranging from 1 to 99 percent' });
    }
  }
  const getProductVariant = await getProductVariantByIdService(productVariant);
  if (!getProductVariant) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
  }
  req.body.product_variant = getProductVariant._id;

  if (getProductVariant.price < amount) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'The product price must be greater than the discount price' });
  }

  const newProductDiscount = await createProductDiscountService(req.body);
  await updateProductDiscountByProductVariantIdService(getProductVariant._id, newProductDiscount._id)

  const productDiscountDto = ModelDto.new(ProductDiscountDto, newProductDiscount);
  return ApiResponse.success(productDiscountDto);
};

export const getAllProductDiscountsController = async (req) => {
  let { keyword = "", limit = 10, page = 1 } = req.query;

  const filterDiscounts = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
    ],
  };

  const totalCount = await countAllProductDiscountsService(filterDiscounts);
  const metaData = calculatePagination(page, limit, totalCount);

  const productDiscounts = await getAllProductDiscountsService({
    filters: filterDiscounts,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  const productDiscountsDto = ModelDto.newList(ProductDiscountDto, productDiscounts);
  return ApiResponse.success({ meta: metaData, list: productDiscountsDto });
};

export const getProductDiscountByIdController = async (req) => {
  const { id } = req.params;
  const existProductDiscount = await getProductDiscountByIdService(id);
  if (!existProductDiscount) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product discount not found' });
  }

  const productDiscountDto = ModelDto.new(ProductDiscountDto, existProductDiscount);
  return ApiResponse.success(productDiscountDto);
};

export const updateProductDiscountByIdController = async (req) => {
  const { id } = req.params;
  const existProductDiscount = await getProductDiscountByIdService(id, "_id product_variant");
  if (!existProductDiscount) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product discount not found' });
  }

  const { amount, is_fixed } = req.body;
  if (is_fixed) {
    if (amount < 1 || amount > 99) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'Discounts ranging from 1 to 99 percent' });
    }
  }
  const getProductVariant = await getProductVariantByIdService(existProductDiscount.product_variant);
  if (!getProductVariant) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
  }

  if (getProductVariant.price < amount) {
    throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'The product price must be greater than the discount price' });
  }

  const updatedProductDiscount = await updateProductDiscountByIdService(id, req.body);

  const productDiscountDto = ModelDto.new(ProductDiscountDto, updatedProductDiscount);
  return ApiResponse.success(productDiscountDto);
};

export const removeProductDiscountByIdController = async (req) => {
  const { id } = req.params;
  const existProductDiscount = await getProductDiscountByIdService(id, "_id");
  if (!existProductDiscount) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product discount not found' });
  }
  await removeProductDiscountByIdService(id);

  return ApiResponse.success();
};