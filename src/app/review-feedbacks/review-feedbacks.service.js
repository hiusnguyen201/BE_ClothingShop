import { isValidObjectId } from "mongoose";
import { ReviewFeedbackModel } from "#src/app/review-feedbacks/schemas/review-feedback.schema";

const SELECTED_FIELDS =
  "_id comment review user createdAt updatedAt";

/**
 * Create review feedback
 * @param {*} data
 * @returns
 */
export async function createReviewFeedbackService(data) {
  return await ReviewFeedbackModel.create(data);
}

/**
 * Get all review feedbacks
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllReviewFeedbacksService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return ReviewFeedbackModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all review feedbacks
 * @param {*} filters
 * @returns
 */
export async function countAllReviewFeedbacksService(filters) {
  return ReviewFeedbackModel.countDocuments(filters);
}

/**
 * Find one review feedback by id
 * @param {*} id
 * @param {*} userId
 * @param {*} selectFields
 * @returns
 */
export async function getReviewFeedbackByIdService(
  id,
  userId,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    filter.review = id;
  }
  if (isValidObjectId(userId)) {
    filter.user = userId;
  } else {
    return null;
  }

  return await ReviewFeedbackModel.findOne(filter).select(selectFields);
}

/**
 * Update review feedback by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateReviewFeedbackByIdService(id, data) {
  return await ReviewFeedbackModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove review feedback by id
 * @param {*} id
 * @returns
 */
export async function removeReviewFeedbackByIdService(id) {
  return await ReviewFeedbackModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}