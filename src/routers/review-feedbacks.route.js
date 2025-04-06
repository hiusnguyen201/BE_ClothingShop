// import express from "express";
// const router = express.Router();

// import {
//     createReviewFeedbackController,
//     getAllReviewFeedbacksController,
//     getReviewFeedbackByIdController,
//     updateReviewFeedbackByIdController,
//     removeReviewFeedbackByIdController,
// } from "#src/app/review-feedbacks/review-feedbacks.controller";
// import { createReviewFeedbackDto } from "#src/app/review-feedbacks/dtos/create-review-feedback.dto";
// import { updateReviewFeedbackDto } from "#src/app/review-feedbacks/dtos/update-review-feedback.dto";
// import {
//     validateBody,
//     validateQuery,
// } from "#src/core/validations/request.validation";
// import { GetListReviewFeedbackDto } from "#src/app/review-feedbacks/dtos/get-list-review-feedback.dto";

// router
//     .get("/get-review-feedbacks",
//         validateQuery(GetListReviewFeedbackDto),
//         getAllReviewFeedbacksController)

//     .get("/get-review-feedback-by-id/:id", getReviewFeedbackByIdController)

//     .post(
//         "/create-review-feedback",
//         validateBody(createReviewFeedbackDto),
//         createReviewFeedbackController
//     )
//     .patch(
//         "/update-review-feedback-by-id/:id",
//         validateBody(updateReviewFeedbackDto),
//         updateReviewFeedbackByIdController
//     )
//     .delete("/remove-review-feedback-by-id/:id", removeReviewFeedbackByIdController)

// export default router;