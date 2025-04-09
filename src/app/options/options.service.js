import { isValidObjectId } from 'mongoose';
import { OptionModel } from '#src/app/options/models/option.model';
import { OptionValueModel } from '#src/app/options/models/option-value.model';

const SELECTED_FIELDS = '_id name optionValues';

/**
 * Create option within transaction
 * @param {*} data
 * @returns
 */
export async function getOrCreateOptionService(data, session) {
  const existOption = await OptionModel.findOne({ name: data.name });

  if (existOption) {
    return existOption;
  }

  const [option] = await OptionModel.insertMany([data], { session });
  return option;
}

/**
 * Get all options
 * @param {*} id
 * @returns
 */
export async function getListOptionService() {
  return OptionModel.find().select(SELECTED_FIELDS).populate({
    path: 'optionValues',
    select: '_id valueName',
  });
}

/**
 * Find one option by id
 * @param {*} id
 * @returns
 */
export async function getOptionByIdService(id, extraFilters) {
  if (!id) return null;
  const filter = {};

  if (isValidObjectId(id)) {
    filter._id = id;
  } else {
    return null;
  }

  return OptionModel.findOne(filter).select(SELECTED_FIELDS).populate({
    path: 'optionValues',
    match: extraFilters,
  });
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
