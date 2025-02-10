import { isValidObjectId } from "mongoose";
import { OptionModel } from "#src/modules/options/schemas/option.schema";

const SELECTED_FIELDS =
  "_id name createdAt updatedAt";

/**
 * Create option
 * @param {*} data
 * @returns
 */
export async function createOptionService(data) {
  return OptionModel.create(data);
}

/**
 * Find one option by id
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

  return await OptionModel.findOne(filter).select(selectFields);
}

/**
 * Get all options
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
  return OptionModel.find(filters)
    .skip(offset)
    .limit(limit)
    .select(selectFields)
    .sort({ createdAt: -1 });
}

/**
 * Count all options
 * @param {*} filters
 * @returns
 */
export async function countAllOptionsService(filters) {
  return OptionModel.countDocuments(filters);
}

/**
 * Update option by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateOptionByIdService(id, data) {
  return await OptionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove option by id
 * @param {*} id
 * @returns
 */
export async function removeOptionByIdService(id) {
  return await OptionModel.findByIdAndDelete(id).select(SELECTED_FIELDS)
}

/**
 * Find exist option name
 * @param {*} id
 * @param {*} skipId
 * @returns
 */
export async function checkExistOptionNameService(name, skipId) {
  const option = await OptionModel.findOne({
    name: name,
    _id: { $ne: skipId },
  }).select("_id");
  return Boolean(option);
}