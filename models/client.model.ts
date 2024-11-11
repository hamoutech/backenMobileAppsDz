import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  pseudo: { type: String, required: true, },
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
  phoneNumber:{type: String},
  resetLink:{
    type:String
  },
  image: ["path/to/image1.jpg", "path/to/image2.jpg"],    
  status: {
    type: String,
    enum: ["VALIDATED", "BANNED"],
    default: "VALIDATED",
  },
  argument: { type: String },
  clubName:{type: String, required: true},
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  },
  gender:{
    type:String,
  }
});

module.exports = mongoose.model("Client", clientSchema);
