import mongoose from "mongoose";

const liveSchema = new mongoose.Schema({
  titled: { type: String },
  link: { type: String, required: true },
  creationDate: { type: String },
  display: {
    type: Boolean,
    required: true,
  },
  match: { type: String },
  description: { type: String, required: true },
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

module.exports = mongoose.model("Live", liveSchema);
