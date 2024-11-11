import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema({
  competitionName: { type: String, required: true },
  phoneNumber: { type: String },
  startDate: { type: String },
  endDate: { type: String },
});

module.exports = mongoose.model("Competition", competitionSchema);
