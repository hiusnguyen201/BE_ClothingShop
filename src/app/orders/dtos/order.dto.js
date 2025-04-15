import Joi from 'joi';

export const OrderDto = Joi.object({
    _id: Joi.any().required(),
    code: Joi.string().required(),
    provinceName: Joi.string().required(),
    districtName: Joi.string().required(),
    wardName: Joi.string().required(),
    address: Joi.string().required(),
    customerName: Joi.string().required(),
    customerPhone: Joi.string().required(),
    customerEmail: Joi.string().allow(null),
    quantity: Joi.number().required(),
    subTotal: Joi.number().required(),
    shippingFee: Joi.number().required(),
    total: Joi.number().required(),
    status: Joi.string().required(),
    payUrl: Joi.string().allow(null),
    // customerId: Joi.any().allow(null),
    paymentId: Joi.any().allow(null),
    // employeeId: Joi.any().allow(null),
    orderStatusHistory: Joi.array().items(Joi.any()).allow(null),
});
