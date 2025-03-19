import express from "express";
const router = express.Router();

import {
    createProductDiscountController,
    getAllProductDiscountsController,
    getProductDiscountByIdController,
    updateProductDiscountByIdController,
    removeProductDiscountByIdController,
} from "#src/app/product-discounts/product-discounts.controller";
import { createProductDiscountDto } from "#src/app/product-discounts/dto/create-product-discount.dto";
import { updateProductDiscountDto } from "#src/app/product-discounts/dto/update-product-discount.dto";
import {
    validateBody,
} from "#src/core/validations/request.validation";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.use([isAuthorized, hasPermission])
router
    .get("/get-product-discounts", getAllProductDiscountsController)
    .get("/get-product-discount-by-id/:id", getProductDiscountByIdController)
    .post(
        "/create-product-discount",
        validateBody(createProductDiscountDto),
        createProductDiscountController
    )
    .patch(
        "/update-product-discount-by-id/:id",
        validateBody(updateProductDiscountDto),
        updateProductDiscountByIdController
    )
    .delete("/remove-product-discount-by-id/:id", removeProductDiscountByIdController)

export default router;
