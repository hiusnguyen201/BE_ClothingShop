import Joi from "joi";
import { CATEGORY_STATUS } from "#src/core/constant";
import { replaceMultiSpacesToSingleSpace } from "#src/utils/string.util";

export const updateCategoryDto = Joi.object({
  name: Joi.string()
    .min(3)
    .max(120)
    .custom((value) => replaceMultiSpacesToSingleSpace(value)),
  status: Joi.string().valid(
    ...[CATEGORY_STATUS.PUBLIC, CATEGORY_STATUS.HIDDEN]
  ),
  parentCategory: Joi.string(),
}).min(1);
