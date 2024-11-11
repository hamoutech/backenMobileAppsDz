import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  phoneNumber: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String },
});

module.exports = mongoose.model("Event", eventSchema);
