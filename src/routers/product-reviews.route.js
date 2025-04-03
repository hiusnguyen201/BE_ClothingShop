import express from "express";
const router = express.Router();

import {
    createProductReviewController,
    getAllProductReviewsController,
    getProductReviewByIdController,
    updateProductReviewByIdController,
    removeProductReviewByIdController,
    getAllProductReviewsByProductIdController,
    getProductReviewsByCustomerIdController,
} from "#src/app/product-reviews/product-reviews.controller";
import { createProductReviewDto } from "#src/app/product-reviews/dtos/create-product-review.dto";
import { updateProductReviewDto } from "#src/app/product-reviews/dtos/update-product-review.dto";
import {
    validateBody,
    validateQuery
} from "#src/core/validations/request.validation";
import { GetListProductReviewDto } from "#src/app/product-reviews/dtos/get-list-product-review.dto";
import { isAuthorizedAndHasPermission } from "#src/middlewares/jwt-auth.middleware";

router
    .get("/get-product-reviews",
        validateQuery(GetListProductReviewDto),
        getAllProductReviewsController)
    .get("/get-product-reviews-by-product-id/:productId",
        getAllProductReviewsByProductIdController)
    .get("/get-product-reviews-by-customer-id/",
        isAuthorizedAndHasPermission,
        getProductReviewsByCustomerIdController)
    .get("/get-product-review-by-id/:id",
        getProductReviewByIdController)

    .post(
        "/create-product-review",
        isAuthorizedAndHasPermission,
        validateBody(createProductReviewDto),
        createProductReviewController
    )
    .patch(
        "/update-product-review-by-id/:id",
        isAuthorizedAndHasPermission,
        validateBody(updateProductReviewDto),
        updateProductReviewByIdController
    )
    .delete("/remove-product-review-by-id/:id",
        isAuthorizedAndHasPermission,
        removeProductReviewByIdController)

export default router;
