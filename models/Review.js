// models/Review.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const ReviewSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Review = models.Review || model("Review", ReviewSchema);
module.exports = Review;