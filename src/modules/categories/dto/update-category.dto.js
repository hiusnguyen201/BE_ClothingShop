import Joi from "joi";
import { CATEGORY_STATUS } from "#src/core/constant";

export const updateCategoryDto = Joi.object({
  name: Joi.string().min(3).max(120),
  // slug: Joi.string().min(3).max(150),
  status: Joi.string().valid(...Object.values(CATEGORY_STATUS)),
  parentCategory: Joi.string(),
});
