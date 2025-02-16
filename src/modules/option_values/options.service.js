import { isValidObjectId } from "mongoose";
import { OptionValueModel } from "#src/modules/option_values/schemas/option-value.schema";

const SELECTED_FIELDS =
  "_id value images createdAt updatedAt";

/**
 * Create option value
 * @param {*} data
 * @returns
 */
export async function createOptionValueService(data) {
  return await OptionValueModel.create(data);
}

/**
 * Find one option value by id
 * @param {*} id
 * @param {*} selectFields
 * @returns
 */
export async function getOptionByIdService(
  id,
  selectFields = SELECTED_FIELDS
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return await OptionValueModel.findOne(filter).select(selectFields);
}

/**
 * Get all option values
 * @param {*} query
 * @param {*} selectFields
 * @returns
 */
export async function getAllOptionsService({
  filters,
  offset = 0,
  limit = 10,
  selectFields = SELECTED_FIELDS,
}) {
  return OptionValueModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all option values
 * @param {*} filters
 * @returns
 */
export async function countAllOptionsService(filters) {
  return OptionValueModel.countDocuments(filters);
}

/**
 * Update option value by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateOptionByIdService(id, data) {
  return await OptionValueModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove option value by id
 * @param {*} id
 * @returns
 */
export async function removeOptionByIdService(id) {
  return await OptionValueModel.findByIdAndDelete(id).select(SELECTED_FIELDS)
}