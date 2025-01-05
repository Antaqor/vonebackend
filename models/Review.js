const mongooseRev = require("mongoose");
const { Schema: ReviewSchemaDef, model: reviewModel, models: reviewModels } =
    mongooseRev;

const ReviewSchema = new ReviewSchemaDef(
    {
        service: { type: ReviewSchemaDef.Types.ObjectId, ref: "Service", required: true },
        user: { type: ReviewSchemaDef.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true },
        comment: { type: String, default: "" },
    },
    { timestamps: true }
);

const Review = reviewModels.Review || reviewModel("Review", ReviewSchema);
module.exports = Review;