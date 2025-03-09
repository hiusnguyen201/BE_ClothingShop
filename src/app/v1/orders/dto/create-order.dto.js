import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';
import mongoose from 'mongoose';

/**
 * Thêm:
 *  + customerId
 *  + provinceId
 *  + districtId
 *  + wardId
 * Bỏ shipping_fee
 * Sửa orderDetails -> productVariants (mảng id của product variant). Ex: [{variantId: "cascas", quantity: 2}]
 *
 *
 * Customer:
 * Gửi mảng id cart lên
 */
export const createOrderDto = Joi.object({
  customerId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }),
  customerName: Joi.string().min(3).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.string()
    .required()
    .custom((value, helper) => {
      if (!value.match(REGEX_PATTERNS.PHONE_VIETNAM)) {
        return helper.message('Invalid vietnam phone number');
      }
      return value;
    }),
  shippingAddress: Joi.string().required(),
  voucherId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  productVariantIds: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        }),
      }),
    )
    .min(1)
    .required(),
});
