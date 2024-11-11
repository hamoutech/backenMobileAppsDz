import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");
const soccerSchema = new mongoose.Schema({
  lastName: { type: String, required: true},
  firstName:{type: String, required: true},
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
  code: { type: String },
  numberPhone:{type: String},
  type:{
    type: Number,
    allowNull: false,
    enum: [1, 2],
      default: 1,
  },
  role:{
    type:String,
    allowNull: false,
    enum: ["ADMIN","MANAGER"],
      default: "ADMIN",
  },
  resetLink:{
    type:String
  },
  verified:{
    type:Boolean,
    default:false
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  }
});
soccerSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Soccer", soccerSchema);
