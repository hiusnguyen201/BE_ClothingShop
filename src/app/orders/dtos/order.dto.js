import Joi from 'joi';

export const OrderDto = Joi.object({
    _id: Joi.string().required(),
    code: Joi.string().required(),
    provinceName: Joi.string().required(),
    districtName: Joi.string().required(),
    wardName: Joi.string().required(),
    address: Joi.string().required(),
    customerName: Joi.string().required(),
    customerPhone: Joi.string().required(),
    orderDate: Joi.date().iso().required(),
    shippingDate: Joi.date().iso().allow(null),
    quantity: Joi.number().required(),
    subTotal: Joi.number().required(),
    shippingFee: Joi.number().required(),
    total: Joi.number().required(),
    isPaid: Joi.boolean().required(),
    status: Joi.string().required(),
    customerId: Joi.any().required(),
    paymentId: Joi.any().required(),
    employeeId: Joi.any().allow(null),
    voucherId: Joi.any().required(),
});
