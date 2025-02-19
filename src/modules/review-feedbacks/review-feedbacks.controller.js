import HttpStatus from "http-status-codes";
import {
  NotFoundException,
} from "#src/core/exception/http-exception";

import {
  createReviewFeedbackService,
  getAllReviewFeedbacksService,
  getReviewFeedbackByIdService,
  updateReviewFeedbackByIdService,
  removeReviewFeedbackByIdService,
  countAllReviewFeedbacksService,
} from "#src/modules/review-feedbacks/review-feedbacks.service"
import { calculatePagination } from "#src/utils/pagination.util";

export const createReviewFeedbackController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";

  const newReviewFeedback = await createReviewFeedbackService({
    ...req.body,
    user: userId
  });

  return {
    statusCode: HttpStatus.CREATED,
    message: "Create review feedback successfully",
    data: newReviewFeedback,
  };
};

export const getAllReviewFeedbacksController = async (req) => {
  let { keyword = "", limit = 10, page = 1 } = req.query;

  const filterOptions = {
    $or: [
      { comment: { $regex: keyword, $options: "i" } },
    ],
  };

  const totalCount = await countAllReviewFeedbacksService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const reviewFeedbacks = await getAllReviewFeedbacksService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all review feedbacks successfully",
    data: {
      meta: metaData,
      list: reviewFeedbacks,
    },
  };
};

export const getReviewFeedbackByUserIdController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
  let { limit = 10, page = 1 } = req.query;

  const filterOptions = {
    user: userId
  };

  const totalCount = await countAllReviewFeedbacksService(filterOptions);
  const metaData = calculatePagination(page, limit, totalCount);

  const reviewFeedbacks = await getAllReviewFeedbacksService({
    filters: filterOptions,
    offset: metaData.offset,
    limit: metaData.limit,
  });

  return {
    statusCode: HttpStatus.OK,
    message: "Get all review feedbacks by customerId successfully",
    data: {
      meta: metaData,
      list: reviewFeedbacks,
    },
  };
};

export const getReviewFeedbackByIdController = async (req) => {
  const { id } = req.params;
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";

  const existReviewFeedback = await getReviewFeedbackByIdService(id, userId);
  if (!existReviewFeedback) {
    throw new NotFoundException("Review feedback not found");
  }

  return {
    statusCode: HttpStatus.OK,
    message: "Get one review feedback successfully",
    data: existReviewFeedback,
  };
};

export const updateReviewFeedbackByIdController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
  const { id } = req.params;

  const existReviewFeedback = await getReviewFeedbackByIdService(id, userId, "_id");
  if (!existReviewFeedback) {
    throw new NotFoundException("Review feedback not found");
  }

  const updatedReviewFeedback = await updateReviewFeedbackByIdService(id, req.body);

  return {
    statusCode: HttpStatus.OK,
    message: "Update review feedback successfully",
    data: updatedReviewFeedback,
  };
};

export const removeReviewFeedbackByIdController = async (req) => {
  const userId = req.user?._id ?? "674c2acaee49e3618bb6a9ff";
  const { id } = req.params;
  const existReviewFeedback = await getReviewFeedbackByIdService(id, userId, "_id");
  if (!existReviewFeedback) {
    throw new NotFoundException("Review feedback not found");
  }

  const removedReviewFeedback = await removeReviewFeedbackByIdService(id);

  return {
    statusCode: HttpStatus.OK,
    message: "Remove review feedback successfully",
    data: removedReviewFeedback,
  };
};