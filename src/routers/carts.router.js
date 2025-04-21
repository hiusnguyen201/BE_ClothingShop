import express from 'express';
const router = express.Router();
import {
    validateBody,
    validateQuery
} from '#src/core/validations/request.validation';
import {
    addToCartController,
    removeFromCartController,
    getCartController,
    clearCartController,
} from '#src/app/carts/carts.controller';
import { isAuthorizedAndIsCustomer } from '#src/middlewares/jwt-auth.middleware';
import { AddToCartDto } from '#src/app/carts/dtos/add-to-cart.dto';
// import { GetListCustomerDto } from '#src/app/customers/dtos/get-list-customer.dto';

router
    .post('/add-item',
        isAuthorizedAndIsCustomer,
        validateBody(AddToCartDto),
        addToCartController)
    .get('/get-cart',
        isAuthorizedAndIsCustomer,
        // validateQuery(GetListCustomerDto),
        getCartController)
    .delete('/clear-cart',
        isAuthorizedAndIsCustomer,
        clearCartController)
    .delete('/remove-item/:productVariantId',
        isAuthorizedAndIsCustomer,
        removeFromCartController);
export default router;