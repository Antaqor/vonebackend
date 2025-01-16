const mongooseCat = require("mongoose");
const {
    Schema: CategorySchemaDef,
    model: categoryModel,
    models: categoryModels,
} = mongooseCat;

const CategorySchema = new CategorySchemaDef(
    {
        name: { type: String, required: true, unique: true },
        subServices: [String],
    },
    { timestamps: true }
);

const Category =
    categoryModels.Category || categoryModel("Category", CategorySchema);

module.exports = Category;
