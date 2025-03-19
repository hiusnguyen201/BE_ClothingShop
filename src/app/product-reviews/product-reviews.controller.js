import HttpStatus from "http-status-codes";
import {
  HttpException,
} from "#src/core/exception/http-exception";

import {
  createProductReviewService,
  getAllProductReviewsService,
  getProductReviewByIdService,
  updateProductReviewByIdService,
  removeProductReviewByIdService,
  countAllProductReviewsService,
} from "#src/app/product-reviews/product-reviews.service"
import { calculatePagination } from "#src/utils/pagination.util";
import { updateProductRatingAndTotalReviewByProductIdService } from "#src/app/products/products.service";

export const createProductReviewController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
  const { product } = req.body;

  const newProductReview = await createProductReviewService({
    ...req.body,
    customer: userId
  });
  updateProductRatingAndTotalReviewByProductIdService(product);

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create product review successfully",
    data: newProductReview,
  };
};

export const getAllProductReviewsController = async (req) => {
  let { keyword = "", limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { comment: { $regex: keyword, $options: "i" } },
    ],
  };

  const totalCount = await countAllProductReviewsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const productReviews = await getAllProductReviewsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all product views successfully",
    data: {
      meta: metaData,
      list: productReviews,
    },
  };
};

export const getAllProductReviewsByProductIdController = async (req) => {
  const { id } = req.params;
  let { limit = 10, page = 1 } = req.query;

  const filterOptions = {
    product: id
  };

  const totalCount = await countAllProductReviewsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const productReviews = await getAllProductReviewsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all product views by productId successfully",
    data: {
      meta: metaData,
      list: productReviews,
    },
  };
};

export const getProductReviewByCustomerIdController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
  let { limit = 10, page = 1 } = req.query;

  const filterOptions = {
    customer: userId
  };

  const totalCount = await countAllProductReviewsService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const productReviews = await getAllProductReviewsService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all product views by customerId successfully",
    data: {
      meta: metaData,
      list: productReviews,
    },
  };
};

export const getProductReviewByIdController = async (req) => {
  const { id } = req.params;
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";

  const existProductReview = await getProductReviewByIdService(id, userId);
  if (!existProductReview) {
    throw new NotFoundException("Product review not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one product review successfully",
    data: existProductReview,
  };
};

export const updateProductReviewByIdController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
  const { id } = req.params;

  const existProductReview = await getProductReviewByIdService(id, userId, "_id product");
  if (!existProductReview) {
    throw new NotFoundException("Product review not found");
  }

  const updatedProductReview = await updateProductReviewByIdService(id, req.body);
  updateProductRatingAndTotalReviewByProductIdService(existProductReview.product);
  return {
    statusCode: HttpStatus.OK,
    message: "Update product review successfully",
    data: updatedProductReview,
  };
};

export const removeProductReviewByIdController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
  const { id } = req.params;
  const existProductReview = await getProductReviewByIdService(id, userId, "_id");
  if (!existProductReview) {
    throw new NotFoundException("Product review not found");
  }

  const removedProductReview = await removeProductReviewByIdService(id);

  return {
    statusCode: HttpStatus.OK,
    message: "Remove product review successfully",
    data: removedProductReview,
  };
};