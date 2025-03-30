import {
  HttpException,
} from "#src/core/exception/http-exception";

import {
  createProductDiscountsService,
  getAllProductDiscountsService,
  countAllProductDiscountsService,
  getProductDiscountByIdService,
  updateProductDiscountByIdService,
  removeProductDiscountByIdService,
} from "#src/app/product-discounts/product-discounts.service"
import { Code } from "#src/core/code/Code";
import { ApiResponse } from "#src/core/api/ApiResponse";
import { ModelDto } from "#src/core/dto/ModelDto";
import { ProductDiscountDto } from "#src/app/product-discounts/dtos/product-discount.dto";
import {
  getProductVariantByIdService,
  updateProductDiscountByProductVariantIdService
} from "#src/app/product-variants/product-variants.service";
import { TransactionalServiceWrapper } from "#src/core/transaction/TransactionalServiceWrapper";

export const createProductDiscountController = async (req) => {
  return await TransactionalServiceWrapper.execute(async (session) => {
    const { name, amount, isFixed, startDate, endDate, productVariant } = req.body;

    const getProductVariant = await getProductVariantByIdService(productVariant);
    if (!getProductVariant) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
    }

    if (getProductVariant.price < amount) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'The product price must be greater than the discount price' });
    }

    const listVariantDiscounts = await getAllProductDiscountsService({
      filter: {
        productVariant: productVariant
      }
    });

    for (const variantDiscount of listVariantDiscounts) {
      if (variantDiscount.endDate > endDate) {
        throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'There are other product discounts that are still active' });
      }
    }

    const newProductDiscount = await createProductDiscountsService([{ name, amount, isFixed, startDate, endDate, productVariant }], session);
    await updateProductDiscountByProductVariantIdService(getProductVariant._id, newProductDiscount._id, session)

    const productDiscountDto = ModelDto.new(ProductDiscountDto, newProductDiscount);
    return ApiResponse.success(productDiscountDto);
  })
};

export const getAllProductDiscountsController = async (req) => {
  const { keyword, limit, page, sortBy, sortOrder } = req.query;

  const filterDiscounts = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
    ],
  };

  const totalCount = await countAllProductDiscountsService(filterDiscounts);

  const productDiscounts = await getAllProductDiscountsService({
    filters: filterDiscounts,
    page,
    limit,
    sortBy,
    sortOrder
  });

  const productDiscountsDto = ModelDto.newList(ProductDiscountDto, productDiscounts);
  return ApiResponse.success({ totalCount, list: productDiscountsDto });
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
  return await TransactionalServiceWrapper.execute(async (session) => {
    const { id } = req.params;
    const existProductDiscount = await getProductDiscountByIdService(id, "_id productVariant");
    if (!existProductDiscount) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product discount not found' });
    }

    const { name, amount, isFixed, startDate, endDate } = req.body;

    const getProductVariant = await getProductVariantByIdService(existProductDiscount.productVariant);
    if (!getProductVariant) {
      throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product variant not found' });
    }

    if (getProductVariant.price < amount) {
      throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'The product price must be greater than the discount price' });
    }

    const listVariantDiscounts = await getAllProductDiscountsService({
      filter: {
        productVariant: existProductDiscount.productVariant
      }
    });

    for (const variantDiscount of listVariantDiscounts) {
      if (variantDiscount.endDate > endDate) {
        throw HttpException.new({ code: Code.CONFLICT, overrideMessage: 'There are other product discounts that are still active' });
      }
    }

    const updatedProductDiscount = await updateProductDiscountByIdService(id, { name, amount, isFixed, startDate, endDate }, session);

    const productDiscountDto = ModelDto.new(ProductDiscountDto, updatedProductDiscount);
    return ApiResponse.success(productDiscountDto);
  })
};

export const removeProductDiscountByIdController = async (req) => {
  const { id } = req.params;
  const existProductDiscount = await getProductDiscountByIdService(id, "_id");
  if (!existProductDiscount) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Product discount not found' });
  }
  await removeProductDiscountByIdService(id);

  return ApiResponse.success({ id: existProductDiscount._id });
};