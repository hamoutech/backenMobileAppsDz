import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

const matchSchema = new mongoose.Schema({
  titled: { type: String, required: true },
  stadiumName: { type: String, required: true },
  competition: { type: String },
  date: {
    type: String,
    // required: true,
  },
  hour: { type: String },
  numberOfGoals: { type: Number },
  goalkeeper: { type: String },
  defender: { type: String },
  midfielder: { type: String },
  attacker: { type: String },
  createdDate: { type: String },
  modificationDate: { type: String },
  myClubName: { type: String },
  myClubResult: { type: Number },
  nameAdversary: { type: String, required: true },
  resultAdversary: { type: Number },
  description: { type: String, required: true },
  joueurs: [
    {
      joueurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Joueur",
        required: true,
      },
      fullName: { type: String },
      minute: { type: String },
    },
  ],
  displayNotif: { type: Boolean },
  notifTitle: { type: String },
  notifBody: { type: String },
  delayed: { type: Boolean },
  adversaryLogo: ["path/to/adversaryLogo.jpg", "path/to/adversaryLogo.jpg"],
  state: {
    type: Boolean,
    required: true,
  },
  notified: {
    type: Boolean,
    default: false,
  },
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
  seats: {
    type: {
      vip: {
        type: {
          price: { type: String, required: true },
          total: { type: Number, required: true },
          reserved: { type: Number, default: 0 },
        },
        _id: false,
      },
      standard: {
        type: {
          price: { type: String, required: true },
          total: { type: Number, required: true },
          reserved: { type: Number, default: 0 },
        },
        _id: false,
      },
    },
    _id: false,
  }
});
matchSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Match", matchSchema);
