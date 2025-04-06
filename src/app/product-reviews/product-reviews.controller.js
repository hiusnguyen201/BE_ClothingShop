// import {
//   HttpException,
// } from "#src/core/exception/http-exception";

// import {
//   createProductReviewService,
//   getAllProductReviewsService,
//   getProductReviewByIdService,
//   updateProductReviewByIdService,
//   removeProductReviewByIdService,
//   countAllProductReviewsService,
// } from "#src/app/product-reviews/product-reviews.service"
// import { updateProductRatingAndTotalReviewByProductIdService } from "#src/app/products/products.service";
// import { ApiResponse } from "#src/core/api/ApiResponse";
// import { ModelDto } from "#src/core/dto/ModelDto";
// import { ProductReviewDto } from "#src/app/product-reviews/dtos/product-review.dto";

// export const createProductReviewController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
//   const { product } = req.body;

//   const newProductReview = await createProductReviewService({
//     ...req.body,
//     customer: userId
//   });
//   updateProductRatingAndTotalReviewByProductIdService(product);

//   const productReviewDto = ModelDto.new(ProductReviewDto, newProductReview);
//   return ApiResponse.success(productReviewDto);
// };

// export const getAllProductReviewsController = async (req) => {
//   let { keyword = "", limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     $or: [
//       { comment: { $regex: keyword, $options: "i" } },
//     ],
//   };

//   const totalCount = await countAllProductReviewsService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const productReviews = await getAllProductReviewsService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   const productReviewsDto = ModelDto.newList(ProductReviewDto, productReviews);
//   return ApiResponse.success({ meta: metaData, list: productReviewsDto });
// };

// export const getAllProductReviewsByProductIdController = async (req) => {
//   const { productId } = req.params;
//   let { limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     product: productId
//   };

//   const totalCount = await countAllProductReviewsService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const productReviews = await getAllProductReviewsService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   const productReviewsDto = ModelDto.newList(ProductReviewDto, productReviews);
//   return ApiResponse.success({ meta: metaData, list: productReviewsDto });
// };

// export const getProductReviewsByCustomerIdController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
//   let { limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     customer: userId
//   };

//   const totalCount = await countAllProductReviewsService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const productReviews = await getAllProductReviewsService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   const productReviewsDto = ModelDto.newList(ProductReviewDto, productReviews);
//   return ApiResponse.success({ meta: metaData, list: productReviewsDto });
// };

// export const getProductReviewByIdController = async (req) => {
//   const { id } = req.params;
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";

//   const existProductReview = await getProductReviewByIdService(id, userId);
//   if (!existProductReview) {
//     throw HttpException.new({ code: Code.NotFoundException, overrideMessage: "Product review not found" });
//   }

//   const productReviewsDto = ModelDto.new(ProductReviewDto, existProductReview);
//   return ApiResponse.success(productReviewsDto);
// };

// export const updateProductReviewByIdController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
//   const { id } = req.params;

//   const existProductReview = await getProductReviewByIdService(id, userId, "_id product");
//   if (!existProductReview) {
//     throw HttpException.new({ code: Code.NotFoundException, overrideMessage: "Product review not found" });
//   }

//   const updatedProductReview = await updateProductReviewByIdService(id, req.body);
//   updateProductRatingAndTotalReviewByProductIdService(existProductReview.product);

//   const productReviewsDto = ModelDto.new(ProductReviewDto, updatedProductReview);
//   return ApiResponse.success(productReviewsDto);
// };

// export const removeProductReviewByIdController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
//   const { id } = req.params;
//   const existProductReview = await getProductReviewByIdService(id, userId, "_id");
//   if (!existProductReview) {
//     throw HttpException.new({ code: Code.NotFoundException, overrideMessage: "Product review not found" });
//   }

//   await removeProductReviewByIdService(id);

//   return ApiResponse.success();
// };