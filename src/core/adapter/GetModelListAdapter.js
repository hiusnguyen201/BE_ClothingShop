import Joi from 'joi';
import { REGEX_PATTERNS } from '#core/constant';
import { replaceMultiSpacesToSingleSpace } from '#utils/string.util';

export class GetModelListAdapter {
  static schema = Joi.object({
    keyword: Joi.string()
      .allow('')
      .default('')
      .trim()
      .custom((value) => replaceMultiSpacesToSingleSpace(value)),
    limit: Joi.number().min(10).max(100).default(10),
    page: Joi.number().min(1).default(1),
    sortBy: Joi.string().pattern(REGEX_PATTERNS.COMMA_SEPARATED_LIST).messages({
      'string.pattern.base': 'sortBy must be a comma-separated list of fields.',
    }),
    sortOrder: Joi.string().pattern(REGEX_PATTERNS.COMMA_SEPARATED_LIST).messages({
      'string.pattern.base': 'sortOrder must be a comma-separated list of fields.',
    }),
  });
}
