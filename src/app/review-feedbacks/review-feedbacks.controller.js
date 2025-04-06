// import {
//   HttpException,
// } from "#src/core/exception/http-exception";

// import {
//   createReviewFeedbackService,
//   getAllReviewFeedbacksService,
//   getReviewFeedbackByIdService,
//   updateReviewFeedbackByIdService,
//   removeReviewFeedbackByIdService,
//   countAllReviewFeedbacksService,
// } from "#src/app/review-feedbacks/review-feedbacks.service"
// import { calculatePagination } from "#src/utils/pagination.util";
// import { ModelDto } from "#src/core/dto/ModelDto";
// import { ApiResponse } from "#src/core/api/ApiResponse";
// import { ReviewFeedbackDto } from "#src/app/review-feedbacks/dtos/review-feedback.dto";

// export const createReviewFeedbackController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";

//   const newReviewFeedback = await createReviewFeedbackService({
//     ...req.body,
//     user: userId
//   });

//   const reviewFeedbackDto = ModelDto.new(ReviewFeedbackDto, newReviewFeedback);
//   return ApiResponse.success(reviewFeedbackDto);
// };

// export const getAllReviewFeedbacksController = async (req) => {
//   let { keyword = "", limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     $or: [
//       { comment: { $regex: keyword, $options: "i" } },
//     ],
//   };

//   const totalCount = await countAllReviewFeedbacksService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const reviewFeedbacks = await getAllReviewFeedbacksService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   const reviewFeedbacksDto = ModelDto.newList(ReviewFeedbackDto, reviewFeedbacks);
//   return ApiResponse.success({ meta: metaData, list: reviewFeedbacksDto });
// };

// export const getReviewFeedbackByUserIdController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
//   let { limit = 10, page = 1 } = req.query;

//   const filterOptions = {
//     user: userId
//   };

//   const totalCount = await countAllReviewFeedbacksService(filterOptions);
//   const metaData = calculatePagination(page, limit, totalCount);

//   const reviewFeedbacks = await getAllReviewFeedbacksService({
//     filters: filterOptions,
//     offset: metaData.offset,
//     limit: metaData.limit,
//   });

//   const reviewFeedbacksDto = ModelDto.newList(ReviewFeedbackDto, reviewFeedbacks);
//   return ApiResponse.success({ meta: metaData, list: reviewFeedbacksDto });
// };

// export const getReviewFeedbackByIdController = async (req) => {
//   const { id } = req.params;
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";

//   const existReviewFeedback = await getReviewFeedbackByIdService(id, userId);
//   if (!existReviewFeedback) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Review feedback not found' });
//   }

//   const reviewFeedbackDto = ModelDto.new(ReviewFeedbackDto, existReviewFeedback);
//   return ApiResponse.success(reviewFeedbackDto);
// };

// export const updateReviewFeedbackByIdController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
//   const { id } = req.params;

//   const existReviewFeedback = await getReviewFeedbackByIdService(id, userId, "_id");
//   if (!existReviewFeedback) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Review feedback not found' });
//   }

//   const updatedReviewFeedback = await updateReviewFeedbackByIdService(id, req.body);

//   const reviewFeedbackDto = ModelDto.new(ReviewFeedbackDto, updatedReviewFeedback);
//   return ApiResponse.success(reviewFeedbackDto);
// };

// export const removeReviewFeedbackByIdController = async (req) => {
//   const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
//   const { id } = req.params;
//   const existReviewFeedback = await getReviewFeedbackByIdService(id, userId, "_id");
//   if (!existReviewFeedback) {
//     throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Review feedback not found' });
//   }

//   await removeReviewFeedbackByIdService(id);

//   return ApiResponse.success();

// };