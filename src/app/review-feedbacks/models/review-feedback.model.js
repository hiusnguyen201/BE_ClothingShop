// import mongoose from "mongoose";
// const { Schema } = mongoose;

// const REVIEW_FEEDBACK_MODEL = "reivew_feedbacks";

// const reviewFeedbackSchema = new Schema(
//   {
//     comment: {
//       type: String,
//       required: true,
//     },

//     review: {
//       type: Schema.Types.ObjectId,
//       ref: "ProductReview"
//     },
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User"
//     }
//   },
//   {
//     versionKey: false,
//     timestamps: true,
//     _id: true,
//     id: false,
//     collection: REVIEW_FEEDBACK_MODEL,
//   }
// );

// const ReviewFeedbackModel = mongoose.model("ReviewFeedback", reviewFeedbackSchema);
// export { ReviewFeedbackModel };
