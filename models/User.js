const mongooseUser = require("mongoose");
const { Schema: UserSchemaDef, model: userModel, models: userModels } = mongooseUser;

const UserSchema = new UserSchemaDef(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            default: "user",
            enum: ["user", "owner"],
        },
    },
    { timestamps: true }
);

const User = userModels.User || userModel("User", UserSchema);
module.exports = User;
