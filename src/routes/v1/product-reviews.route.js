import express from "express";
const router = express.Router();

import {
    createProductReviewController,
    getAllProductReviewsController,
    getProductReviewByIdController,
    updateProductReviewByIdController,
    removeProductReviewByIdController,
    getAllProductReviewsByProductIdController,
    getProductReviewByCustomerIdController,
} from "#src/modules/product-reviews/product-reviews.controller";
import { createProductReviewDto } from "#src/modules/product-reviews/dto/create-product-review.dto";
import { updateProductReviewDto } from "#src/modules/product-reviews/dto/update-product-review.dto";
import {
    validateSchema,
} from "#src/middlewares/validate-request.middleware";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.use([isAuthorized, hasPermission])
router
    .get("/get-product-reviews", getAllProductReviewsController)
    .get("/get-product-reviews-by-product-id/:id", getAllProductReviewsByProductIdController)
    .get("/get-product-reviews-by-customer-id/", getProductReviewByCustomerIdController)
    .get("/get-product-review-by-id/:id", getProductReviewByIdController)

    .post(
        "/create-product-review",
        validateSchema(createProductReviewDto),
        createProductReviewController
    )
    .patch(
        "/update-product-review-by-id/:id",
        validateSchema(updateProductReviewDto),
        updateProductReviewByIdController
    )
    .delete("/remove-product-review-by-id/:id", removeProductReviewByIdController)

export default router;
