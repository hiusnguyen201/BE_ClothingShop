import Joi from "joi";
import { CATEGORY_STATUS } from "#src/core/constant";

export const createCategoryDto = Joi.object({
  name: Joi.string().min(3).max(120).required(),
  status: Joi.string().valid(...Object.values(CATEGORY_STATUS)).required(),
  parentCategory: Joi.string(),
});
