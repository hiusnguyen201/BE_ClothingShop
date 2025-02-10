import express from "express";
const router = express.Router();

import {
    createProductDiscountController,
    getAllProductDiscountsController,
    getProductDiscountByIdController,
    updateProductDiscountByIdController,
    removeProductDiscountByIdController,
} from "#src/modules/product_discounts/product_discounts.controller";
import { createProductDiscountDto } from "#src/modules/product_discounts/dto/create-product-discount.dto";
import { updateProductDiscountDto } from "#src/modules/product_discounts/dto/update-product-discount.dto";
import {
    validateSchema,
} from "#src/middlewares/validate-request.middleware";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.use([isAuthorized, hasPermission])
router
    .get("/get-product-discounts", getAllProductDiscountsController)
    .get("/get-product-discount-by-id/:id", getProductDiscountByIdController)
    .post(
        "/create-product-discount",
        validateSchema(createProductDiscountDto),
        createProductDiscountController
    )
    .patch(
        "/update-product-by-id/:id",
        validateSchema(updateProductDiscountDto),
        updateProductDiscountByIdController
    )
    .delete("/remove-product-discount-by-id/:id", removeProductDiscountByIdController)

export default router;
