import express from "express";
const router = express.Router();

import {
    createProductTagsController,
    getAllProductsTagsController,
    getProductTagByIdController,
    removeProductTagByIdController

} from "#src/modules/products_tags/products_tags.controller";
import { createProductTagsDto } from "#src/modules/products_tags/dto/create-product-tags.dto";
import { deleteProductTagsDto } from "#src/modules/products_tags/dto/delete-product-tags.dto";
import {
    validateSchema,
} from "#src/middlewares/validate-request.middleware";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.use([isAuthorized, hasPermission])
router
    .get("/get-products-tags", getAllProductsTagsController)
    .get("/get-product-tag-by-id/:id", getProductTagByIdController)
    .post(
        "/create-product-tags",
        validateSchema(createProductTagsDto),
        createProductTagsController
    )
    .delete("/remove-tag-by-product-id/:productId",
        validateSchema(deleteProductTagsDto),
        removeProductTagByIdController)

export default router;
