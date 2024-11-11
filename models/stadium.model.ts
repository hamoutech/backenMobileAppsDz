import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");
const stadiumSchema = new mongoose.Schema({
  stadiumName: { type: String, required: true, unique: true },
  location: { type: String },
  stadiumCapacity: { type: String, required: true },
  gps: { type: String },
  stadiumFieldSize: { type: String },
  stadiumImage: ["path/to/stadiumImage1.jpg", "path/to/stadiumImage2.jpg"],
  architect: { type: String },
  totalSurface: { type: String },
  builder: { type: String },
  tenant: { type: String },
  description: { type: String, required: true, min: 80 },
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
stadiumSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Stadium", stadiumSchema);
