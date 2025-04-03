import Joi from 'joi';

export const ShippingAddressDto = Joi.object({
    _id: Joi.string().required(),
    address: Joi.string().required(),
    province: Joi.string().required(),
    district: Joi.string().required(),
    ward: Joi.string().required(),
    isDefault: Joi.bool().required(),
    customer: Joi.any().required()
});
