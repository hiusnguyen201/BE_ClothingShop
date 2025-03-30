import { isValidObjectId } from "mongoose";
import { OptionModel } from "#src/app/options/models/option.model";

const SELECTED_FIELDS =
  "_id name optionValues createdAt updatedAt";

/**
 * Create option
 * @param {*} data
 * @returns
 */
export async function createOptionService(data) {
  const existOption = await OptionModel.findOne({ name: data.name })

  if (existOption) {
    return existOption
  }

  return OptionModel.create(data);
}

/**
 * Find one option by id
 * @param {*} id
 * @returns
 */
export async function getOptionByIdService(
  id,
  extraFilters
) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return OptionModel.findOne(filter).select(SELECTED_FIELDS).populate({
    path: "optionValues",
    match: extraFilters
  });
}

/**
 * Update product option by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateOptionByIdService(id, data) {
  return OptionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove product option by id
 * @param {*} id
 * @returns
 */
export async function removeOptionByIdService(id) {
  return await OptionModel.findByIdAndDelete(id)
    .select(SELECTED_FIELDS)
}

/**
 * Update product option sizes by id
 * @param {*} id
 * @param {*} optionSizes
 * @returns
 */
export async function updateOptionSizesByIdService(id, optionSizes) {
  return await OptionModel.findByIdAndUpdate(
    id,
    {
      $addToSet: { option_sizes: { $each: optionSizes } }
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}

/**
 * Remove product option sizes by id
 * @param {*} id
 * @param {*} optionSizes
 * @returns
 */
export async function removeOptionSizesByIdService(id, optionSizes) {
  return await OptionModel.findByIdAndUpdate(
    id,
    {
      $pull: { option_sizes: { $each: optionSizes } }
    },
    { new: true }
  ).select(SELECTED_FIELDS);
}