import Joi from 'joi';

export const GetShippingAddressDto = Joi.object({
  shippingAddressId: Joi.string().required(),
});
