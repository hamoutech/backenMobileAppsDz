import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");
const partnerSchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true},
  RC: { type: String, required: true, unique: true},
  image: ["path/to/image1.jpg", "path/to/image2.jpg"],
  phoneNumber:{type: String, required: true},
  description:{type: String , required: true, min:6},
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  clubId:{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: "Club",
  },
  clubName:{type:String},
  status: {
    type: String,
    enum: ["VALIDATED", "PENDING", "REFUSED"],
    default: "PENDING",
  },
  argument: { type: String },
  createdDate: { type: String},
  modificationDate: { type: String },
  createdBy:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  }],
  editedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
  ]
});
partnerSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Partner", partnerSchema);