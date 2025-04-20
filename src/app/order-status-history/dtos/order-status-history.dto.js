import Joi from 'joi';

export const OrderStatusHistoryDto = Joi.object({
  _id: Joi.any().required(),

  order: Joi.any().required(),
  status: Joi.string().required(),

  assignedTo: Joi.any().allow(null),

  shippingCarrier: Joi.string().allow(null),
  trackingNumber: Joi.string().allow(null),
  expectedShipDate: Joi.string().allow(null),

  createdAt: Joi.any().required(),
  updatedAt: Joi.any().required(),
});
