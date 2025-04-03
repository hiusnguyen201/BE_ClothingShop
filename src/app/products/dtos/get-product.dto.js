import Joi from 'joi';

export const GetProductDto = Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().required(),
    slug: Joi.string().required(),
    shortDescription: Joi.string().allow(null),
    content: Joi.string().allow(null),
    category: Joi.any().required(),
    subCategory: Joi.string().allow(null),
    productVariants: Joi.array().items(Joi.object()).allow(null),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
});