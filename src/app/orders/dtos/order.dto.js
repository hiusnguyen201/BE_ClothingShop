import Joi from 'joi';

export const OrderDto = Joi.object({
  _id: Joi.any().required(),

  customer: Joi.any().required(),
  customerName: Joi.string().required(),
  customerPhone: Joi.string().required(),
  customerEmail: Joi.string().required(),

  provinceName: Joi.string().required(),
  districtName: Joi.string().required(),
  wardName: Joi.string().required(),
  address: Joi.string().required(),

  code: Joi.number().required(),
  quantity: Joi.number().required(),
  subTotal: Joi.number().required(),
  shippingFee: Joi.number().required(),
  total: Joi.number().required(),

  trackingNumber: Joi.string().allow(null),

  trackingLog: Joi.array().items(Joi.any()).allow(null),

  orderDate: Joi.any().required(),

  payment: Joi.any().allow(null),

  orderStatusHistory: Joi.array().items(Joi.any()),

  orderDetails: Joi.array().items(Joi.any()).required().min(1),
});
