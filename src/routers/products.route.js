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
} from "#src/app/products/products.controller";
import { CreateProductDto } from "#src/app/products/dtos/create-product.dto";
import { updateProductDto } from "#src/app/products/dtos/update-product.dto";
import { checkExistProductNameDto } from "#src/app/products/dtos/check-exist-product-name.dto";
import {
    validateBody,
    validateQuery
} from "#src/core/validations/request.validation";
import { isAuthorizedAndHasPermission } from "#src/middlewares/jwt-auth.middleware";
import { GetListProductDto } from "#src/app/products/dtos/get-list-product.dto";

router.post(
    "/is-exist-product-name",
    validateBody(checkExistProductNameDto),
    isExistProductNameController
);

router
    .get("/get-products",
        validateQuery(GetListProductDto),
        getAllProductsController)
    .get("/get-product-by-id/:id",
        getProductByIdController)
    .post(
        "/create-product",
        // isAuthorizedAndHasPermission,
        validateBody(CreateProductDto),
        createProductController
    )
    .patch(
        "/update-product-by-id/:id",
        // isAuthorizedAndHasPermission,
        validateBody(updateProductDto),
        updateProductByIdController
    )
    .delete("/remove-product-by-id/:id",
        isAuthorizedAndHasPermission,
        removeProductByIdController)
    .patch("/show-product-by-id/:id",
        isAuthorizedAndHasPermission,
        showProductByIdController)
    .patch("/hide-product-by-id/:id",
        isAuthorizedAndHasPermission,
        hideProductByIdController);

export default router;
