import express from "express";
const router = express.Router();

import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductByIdController,
    removeProductByIdController,
    isExistProductNameController,
    showProductByIdController,
    hideProductByIdController,
} from "#src/modules/products/products.controller";
import { createProductDto } from "#src/modules/products/dto/create-product.dto";
import { updateProductDto } from "#src/modules/products/dto/update-product.dto";
import { checkExistProductNameDto } from "#src/modules/products/dto/check-exist-product-name.dto";
import {
    validateSchema,
} from "#src/middlewares/validate-request.middleware";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

router.post(
    "/is-exist-product-name",
    validateSchema(checkExistProductNameDto),
    isExistProductNameController
);

// router.use([isAuthorized, hasPermission])
router
    .get("/get-products", getAllProductsController)
    .get("/get-product-by-id/:id", getProductByIdController)
    .post(
        "/create-product",
        validateSchema(createProductDto),
        createProductController
    )
    .patch(
        "/update-product-by-id/:id",
        validateSchema(updateProductDto),
        updateProductByIdController
    )
    .delete("/remove-product-by-id/:id", removeProductByIdController)
    .patch("/show-product-by-id/:id", showProductByIdController)
    .patch("/hide-product-by-id/:id", hideProductByIdController);

export default router;
