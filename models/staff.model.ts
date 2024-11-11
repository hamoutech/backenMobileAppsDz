import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");
const allowedTypes = ["Staff technique", "Staff médical"];
const staffSchema = new mongoose.Schema({
  fullName: { type: String, required: true},
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  numberPhone:{type: String, required:true},
  type:{
    type: String,
    required: true,
    enum: allowedTypes,
  },
  job:{
    type: String,
    required: true
  },
  createdDate:{type: String},
  modificationDate:{type:String},
  createdBy:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  }],
  editedBy:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  }]
});
staffSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Staff", staffSchema);
