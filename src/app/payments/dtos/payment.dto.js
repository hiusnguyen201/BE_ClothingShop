import Joi from 'joi';

export const PaymentDto = Joi.object({
    _id: Joi.any().required(),
    paymentMethod: Joi.string().required(),
    amountPaid: Joi.number().allow(null),
    paidDate: Joi.date().iso().allow(null),
    transactionId: Joi.string().required(),
    notes: Joi.string().allow(null),
    orderId: Joi.any().required()
});
