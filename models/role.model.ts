import mongoose from "mongoose";

const privilageSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  description: { type: String },
  privileges: { type: String },
  createdBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
  ],
});

module.exports = mongoose.model("Privilage", privilageSchema);
