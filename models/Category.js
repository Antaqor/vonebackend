// models/Category.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CategorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        subServices: [{ type: String }],
    },
    { timestamps: true }
);

module.exports = model("Category", CategorySchema);