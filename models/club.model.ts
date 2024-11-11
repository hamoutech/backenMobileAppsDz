import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  headName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  emailClub: {
    type: String,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  createdDate: { type: String, required: true },
  modificationDate: { type: String },
  creationDateClub: { type: String },
  description: { type: String, required: true, min: 6 },
  phoneNumber: { type: String, required: true },
  phoneNumberClub: { type: String },
  nbrTitreGagner: { type: String },
  address: { type: String },
  image: ["path/to/image1.jpg", "path/to/image2.jpg"],
  password: { type: String, min: 6 },
  status: {
    type: String,
    enum: ["VALIDATED", "PENDING", "BANNED"],
    default: "VALIDATED",
  },
  argument: { type: String },
  createdBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Soccer",
    },
  ],
  editedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Soccer",
    },
  ],
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  joueur: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Joueur",
    },
  ],
  news: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
    },
  ],
  match: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
    },
  ],
  stadium: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stadium",
    },
  ],
  live: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Live",
    },
  ],
});
clubSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Club", clubSchema);
