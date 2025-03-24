import Joi from 'joi';

export const TagDto = Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().required(),
    slug: Joi.string().required(),
    products: Joi.array().items(Joi.string()).required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
});
