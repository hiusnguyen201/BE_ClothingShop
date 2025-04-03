import express from "express";
const router = express.Router();

import {
    createProductDiscountController,
    getAllProductDiscountsController,
    getProductDiscountByIdController,
    updateProductDiscountByIdController,
    removeProductDiscountByIdController,
} from "#src/app/product-discounts/product-discounts.controller";
import { createProductDiscountDto } from "#src/app/product-discounts/dtos/create-product-discount.dto";
import { updateProductDiscountDto } from "#src/app/product-discounts/dtos/update-product-discount.dto";
import {
    validateBody,
    validateQuery,
} from "#src/core/validations/request.validation";
import { GetListProductDiscountDto } from "#src/app/product-discounts/dtos/get-list-product-discount.dto";
import { isAuthorizedAndHasPermission } from "#src/middlewares/jwt-auth.middleware";

router
    .get("/get-product-discounts",
        isAuthorizedAndHasPermission,
        validateQuery(GetListProductDiscountDto),
        getAllProductDiscountsController)
    .get("/get-product-discount-by-id/:id",
        isAuthorizedAndHasPermission,
        getProductDiscountByIdController)
    .post(
        "/create-product-discount",
        // isAuthorizedAndHasPermission,
        validateBody(createProductDiscountDto),
        createProductDiscountController
    )
    .patch(
        "/update-product-discount-by-id/:id",
        isAuthorizedAndHasPermission,
        validateBody(updateProductDiscountDto),
        updateProductDiscountByIdController
    )
    .delete("/remove-product-discount-by-id/:id",
        isAuthorizedAndHasPermission,
        removeProductDiscountByIdController)

export default router;
