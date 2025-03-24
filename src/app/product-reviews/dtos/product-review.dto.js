import Joi from 'joi';

export const ProductReviewDto = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().required(),
  short_description: Joi.string(),
  content: Joi.string(),
  is_hidden: Joi.boolean().required(),
  is_featured: Joi.boolean().required(),
  is_new: Joi.boolean().required(),
  avg_rating: Joi.number().required(),
  total_review: Joi.number().required(),
  category: Joi.string().required(),
  sub_category: Joi.string().required(),
  product_discount: Joi.string().required(),
  product_variants: Joi.array().items(Joi.string()).required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
});
