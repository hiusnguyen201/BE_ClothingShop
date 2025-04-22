import { isValidObjectId } from 'mongoose';
import { OptionModel } from '#src/app/options/models/option.model';
import { OptionValueModel } from '#src/app/options/models/option-value.model';

/**
 * New Option Value instance
 * @param {*} data
 * @returns
 */
export function newOptionValueService(data) {
  return new OptionValueModel(data);
}

/**
 * Insert list option value
 * @param {*} data
 * @returns
 */
export async function insertOptionValuesService(data, session) {
  return await OptionValueModel.bulkSave(data, { session, ordered: true });
}

/**
 * New Option instance
 * @param {*} data
 * @returns
 */
export function newOptionService(data) {
  return new OptionModel(data);
}

/**
 * Insert list option
 * @param {*} data
 * @returns
 */
export async function insertOptionsService(data = [], session) {
  return await OptionModel.bulkSave(data, { session, ordered: true });
}

/**
 * Get all options
 * @param {*} id
 * @returns
 */
export async function getListOptionService() {
  return OptionModel.find().populate({
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
    filter.name = id;
  }

  return OptionModel.findOne(filter).populate({
    path: 'optionValues',
    match: extraFilters,
  });
}
