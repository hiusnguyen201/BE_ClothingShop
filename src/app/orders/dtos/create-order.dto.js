import { PAYMENT_METHOD } from '#src/core/constant';
import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const createOrderDto = Joi.object({
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),
  productVariants: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().custom(objectIdValidator),
        quantity: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
  paymentMethod: Joi.string()
    .required()
    .valid(...Object.values(PAYMENT_METHOD))
});

export const createOrderCustomerDto = Joi.object({
  customerId: Joi.string().custom(objectIdValidator),
  provinceName: Joi.string().min(3).max(50),
  districtName: Joi.string().min(3).max(50),
  wardName: Joi.string().min(3).max(50),
  address: Joi.string().min(3).max(255),
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),
  shippingAddressId: Joi.string().required(),
  voucherId: Joi.string().custom(objectIdValidator).optional(),
  cartIds: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().custom(objectIdValidator),
        productId: Joi.string().custom(objectIdValidator),
        quantity: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
});
