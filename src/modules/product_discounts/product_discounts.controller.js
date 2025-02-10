import HttpStatus from "http-status-codes";
import {
  NotFoundException,
} from "#src/core/exception/http-exception";

import {
  createProductDiscountService,
  getAllProductDiscountsService,
  countAllProductDiscountsService,
  getProductDiscountByIdService,
  updateProductDiscountByIdService,
  removeProductDiscountByIdService,
} from "#src/modules/product_discounts/product_discounts.service"
import { calculatePagination } from "#src/utils/pagination.util";

export const createProductDiscountController = async (req) => {

  const newProductDiscount = await createProductDiscountService(req.body);

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create product discount successfully",
    data: newProductDiscount,
  };
};

export const getAllProductDiscountsController = async (req) => {
  let { keyword = "", product, limit = 10, page = 1 } = req.query;

  const filterDiscounts = {
    $or: [
      { name: { $regex: keyword, $discounts: "i" } },
    ],
    ...(product ? { product } : {})
  };

  const totalCount = await countAllProductDiscountsService(filterDiscounts);
  const metaData = calculatePagination(page, limit, totalCount);

  const productDiscounts = await getAllProductDiscountsService({
    filters: filterDiscounts,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all product discounts successfully",
    data: {
      meta: metaData,
      list: productDiscounts,
    },
  };
};

export const getProductDiscountByIdController = async (req) => {
  const { id } = req.params;
  const existProductDiscount = await getProductDiscountByIdService(id);
  if (!existProductDiscount) {
    throw new NotFoundException("Product discount not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one product discount successfully",
    data: existProductDiscount,
  };
};

export const updateProductDiscountByIdController = async (req) => {
  const { id } = req.params;

  const existProductDiscount = await getProductDiscountByIdService(id, "_id");
  if (!existProductDiscount) {
    throw new NotFoundException("Product discount not found");
  }

  const updatedProductDiscount = await updateProductDiscountByIdService(id, req.body);

  return {
    statusCode: HttpStatus.OK,
    message: "Update product discount successfully",
    data: updatedProductDiscount,
  };
};

export const removeProductDiscountByIdController = async (req) => {
  const { id } = req.params;
  const existProductDiscount = await getProductDiscountByIdService(id, "_id");
  if (!existProductDiscount) {
    throw new NotFoundException("Product discount not found");
  }
  const removedProductDiscount = await removeProductDiscountByIdService(id);

  return {
    statusCode: HttpStatus.OK,
    message: "Remove product discount successfully",
    data: removedProductDiscount,
  };
};