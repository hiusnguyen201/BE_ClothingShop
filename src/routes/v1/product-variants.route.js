import express from "express";
const router = express.Router();

import {
    createProductVariantController,
    getAllProductVariantsController,
    getProductVariantByIdController,
    updateProductVariantByIdController,
    removeProductVariantByIdController,

} from "#src/modules/product_variants/product_variants.controller"
import { createProductVariantDto } from "#src/modules/product_variants/dto/create-product-variants.dto";
import { updateProductVariantDto } from "#src/modules/product_variants/dto/update-product-variants.dto";
import {
    validateSchema,
} from "#src/middlewares/validate-request.middleware";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.use([isAuthorized, hasPermission])
router
    .get("/get-product-variants", getAllProductVariantsController)
    .get("/get-product-variant-by-id/:id", getProductVariantByIdController)
    .post(
        "/create-product-variant",
        validateSchema(createProductVariantDto),
        createProductVariantController
    )
    .patch(
        "/update-product-variant-by-id/:id",
        validateSchema(updateProductVariantDto),
        updateProductVariantByIdController
    )
    .delete("/remove-product-variant-by-id/:id", removeProductVariantByIdController)

export default router;
