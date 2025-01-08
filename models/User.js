const mongooseUsr = require("mongoose");
const { Schema: UserSchemaDef, model: userModel, models: userModels } = mongooseUsr;
const UserSchema = new UserSchemaDef({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user","owner","stylist"] },
    appointments: [{ type: UserSchemaDef.Types.ObjectId, ref: "Appointment" }],
},{ timestamps: true });
const User = userModels.User || userModel("User", UserSchema);
module.exports = User;