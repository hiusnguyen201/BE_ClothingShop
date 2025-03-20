import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';
import mongoose from 'mongoose';

export const createOrderDto = Joi.object({
  customerId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }),
  provinceName: Joi.string().min(3).max(50),
  districtName: Joi.string().min(3).max(50),
  wardName: Joi.string().min(3).max(50),
  address: Joi.string().min(3).max(255),
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),
  shippingAddressId: Joi.string().required(),
  voucherId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  productVariants: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }),
        quantity: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
});

export const createOrderCustomerDto = Joi.object({
  customerId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }),
  provinceName: Joi.string().min(3).max(50),
  districtName: Joi.string().min(3).max(50),
  wardName: Joi.string().min(3).max(50),
  address: Joi.string().min(3).max(255),
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.phoneNumber('VN').required(),
  shippingAddressId: Joi.string().required(),
  voucherId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  cartIds: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }),
        productId: Joi.string().custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }),
        quantity: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
});
