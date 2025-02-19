import express from "express";
const router = express.Router();

import {
    createReviewFeedbackController,
    getAllReviewFeedbacksController,
    getReviewFeedbackByIdController,
    updateReviewFeedbackByIdController,
    removeReviewFeedbackByIdController,
} from "#src/modules/review-feedbacks/review-feedbacks.controller";
import { createReviewFeedbackDto } from "#src/modules/review-feedbacks/dto/create-review-feedback.dto";
import { updateReviewFeedbackDto } from "#src/modules/review-feedbacks/dto/update-review-feedback.dto";
import {
    validateSchema,
} from "#src/middlewares/validate-request.middleware";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.use([isAuthorized, hasPermission])
router
    .get("/get-review-feedbacks", getAllReviewFeedbacksController)
    .get("/get-review-feedback-by-id/:id", getReviewFeedbackByIdController)

    .post(
        "/create-review-feedback",
        validateSchema(createReviewFeedbackDto),
        createReviewFeedbackController
    )
    .patch(
        "/update-review-feedback-by-id/:id",
        validateSchema(updateReviewFeedbackDto),
        updateReviewFeedbackByIdController
    )
    .delete("/remove-review-feedback-by-id/:id", removeReviewFeedbackByIdController)

export default router;