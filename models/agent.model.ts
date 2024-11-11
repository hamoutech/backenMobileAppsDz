import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  fullName: { type: String, required: true, },
  identityCardNumber: { type: String, required: true, },
  birthDate: { type: String, required: true, },
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: { type: String, required: true, min: 6 },
  confirmPassword: { type: String, required: true },
  phoneNumber:{type: String, required: true},
  image: ["path/to/image1.jpg", "path/to/image2.jpg"],
  handicap: {type: Boolean, required: true},
  status: {
    type: String,
    enum: ["VALIDATED", "BANNED"],
    default: "VALIDATED",
  },
  resetLink:{
    type:String
  },
  argument: { type: String },
  clubName:{type: String, required: true},
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  },
});

module.exports = mongoose.model("Agent", agentSchema);
