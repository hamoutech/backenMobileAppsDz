import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");
const newsSchema = new mongoose.Schema({
  articleTitle: { type: String, unique: true,required:true, },
  articleTitleArab: { type: String, unique: true },
  language: {
    type: [String],
    enum: ["fr", "arb"],
    required: true,
  },
  image: ["path/to/image1.jpg", "path/to/image2.jpg"],
  video: { type: String },
  createdDate: { type: String, required: true },
  modificationDate: { type: String },
  description: { type: String, required: true, min: 6 },
  description_arab: { type: String, min: 6 },
  displayNotif:{type:Boolean},
  notifTitle:{type:String},
  notifBody:{type:String},
  link:{type:String},
  status:{type : String, enum:["Validated", "Future"]},
  createdBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
  ],
  editedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
  ],
});
newsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("News", newsSchema);
