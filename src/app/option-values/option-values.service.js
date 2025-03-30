import { isValidObjectId } from 'mongoose';
import { OptionValueModel } from '#src/app/option-values/models/option-value.model';

const SELECTED_FIELDS = '_id valueName createdAt updatedAt';

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
export async function getOptionValueByIdService(id) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return await OptionValueModel.findOne(filter).select(SELECTED_FIELDS);
}

// /**
//  * Get all option sizes
//  * @param {*} query
//  * @param {*} selectFields
//  * @returns
//  */
// export async function getAllOptionValuesService({
//   filters,
//   offset = 0,
//   limit = 10,
// }) {
//   return OptionValueModel.find(filters)
//     .skip(offset)
//     .limit(limit)
//     .select(selectFields)
//     .sort({ createdAt: -1 });
// }

// /**
//  * Count all option sizes
//  * @param {*} filters
//  * @returns
//  */
// export async function countAllOptionValuesService(filters) {
//   return OptionValueModel.countDocuments(filters);
// }

/**
 * Update option size by id
 * @param {*} id
 * @param {*} data
 * @returns
 */
export async function updateOptionValueByIdService(id, data) {
  return await OptionValueModel.findByIdAndUpdate(id, data, {
    new: true,
  }).select(SELECTED_FIELDS);
}

/**
 * Remove option size by id
 * @param {*} id
 * @returns
 */
export async function removeOptionValueByIdService(id) {
  return await OptionValueModel.findByIdAndDelete(id).select(SELECTED_FIELDS);
}

/**
 * Create option values within transaction
 * @param {*} data
 * @returns
 */
export async function getOrCreateOptionValuesService(data = [], session) {
  const existingOptionValues = await OptionValueModel.find({
    valueName: { $in: data.map((item) => item.valueName) },
  }).lean();

  const existingSet = new Set(existingOptionValues.map((item) => item.valueName));

  const newOptionValuesData = data.filter((item) => !existingSet.has(item.valueName));

  if (newOptionValuesData.length > 0) {
    const created = await OptionValueModel.insertMany(newOptionValuesData, { session });
    return [...existingOptionValues, ...created];
  }

  return existingOptionValues;
}
