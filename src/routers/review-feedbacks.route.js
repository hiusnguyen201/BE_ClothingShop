import express from "express";
const router = express.Router();

import {
    createReviewFeedbackController,
    getAllReviewFeedbacksController,
    getReviewFeedbackByIdController,
    updateReviewFeedbackByIdController,
    removeReviewFeedbackByIdController,
} from "#src/app/review-feedbacks/review-feedbacks.controller";
import { createReviewFeedbackDto } from "#src/app/review-feedbacks/dto/create-review-feedback.dto";
import { updateReviewFeedbackDto } from "#src/app/review-feedbacks/dto/update-review-feedback.dto";
import {
    validateBody,
} from "#src/core/validations/request.validation";
// import { hasPermission, isAuthorized } from "#src/middlewares/jwt-auth.middleware";

// router.use([isAuthorized, hasPermission])
router
    .get("/get-review-feedbacks", getAllReviewFeedbacksController)
    .get("/get-review-feedback-by-id/:id", getReviewFeedbackByIdController)

    .post(
        "/create-review-feedback",
        validateBody(createReviewFeedbackDto),
        createReviewFeedbackController
    )
    .patch(
        "/update-review-feedback-by-id/:id",
        validateBody(updateReviewFeedbackDto),
        updateReviewFeedbackByIdController
    )
    .delete("/remove-review-feedback-by-id/:id", removeReviewFeedbackByIdController)

export default router;