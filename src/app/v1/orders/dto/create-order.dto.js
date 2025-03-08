import Joi from 'joi';
import { REGEX_PATTERNS } from '#src/core/constant';
import mongoose from 'mongoose';
import { createOrderDetailDto } from '#src/app/v1/orderDetails/dto/create-order-detail.dto';

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
  customer_name: Joi.string().min(3).max(100).required(),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string()
    .required()
    .custom((value, helper) => {
      if (!value.match(REGEX_PATTERNS.PHONE_VIETNAM)) {
        return helper.message('Invalid vietnam phone number');
      }
      return value;
    }),
  shipping_address: Joi.string().required(),
  shipping_fee: Joi.number().required(),
  voucherId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  orderDetails: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        unit_price: Joi.number().integer().min(0).required(),
        discount: Joi.number().integer().min(0).default(0),
      }),
    )
    .min(1)
    .required(),
});
