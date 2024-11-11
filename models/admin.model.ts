import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  role:{
    type:String,
    default: "ADMIN",
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  }
});
adminSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Admin", adminSchema);
