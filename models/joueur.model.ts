import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

const allowedPositions = ["goalkeeper", "midfielder", "defender", "attacker"];
const arabicAllowedPositions = ["حارس المرمى", "لاعب خط وسط", "مدافع", "مهاجم"];
const joueurSchema = new mongoose.Schema({
  language: {
    type: [String],
    enum: ["fr", "arb"],
    required: true,
  },
  fullName: { type: String, required: true},
  arabicFullName: { type: String},
  dateOfBirth: {
    type: String,
    required: true,
  },
  numberPhone:{type: String, required:true, unique:true},
  placeOfBirth:{type: String},
  arabicPlaceOfBirth:{type: String},
  position: {
    type: String,
    required: true,
    enum: allowedPositions, 
  },
  arabicPosition: {
    type: String,
    enum: arabicAllowedPositions, 
  },
  image: ["path/to/image1.jpg", "path/to/image2.jpg"],
  video: ["path/to/video1.mp4", "path/to/video2.mp4"],
  numberOfMatches:{type:Number, default:0},
  numberOfGoals:{type:Number, default:0},
  numberOfDecisivePasses:{type:Number, default:0},
  nationality:{type:String},
  arabicNationality:{type:String},
  atTheClubSince:{type:String},
  size:{type:String},
  weight:{type:String},
  strongFoot:{type:String},
  arabicStrongFoot:{type:String},
  previousClubName:{type:String},
  arabicPreviousClubName:{type:String},
  previousClubYears:{type:String},
  previousClubNumberOfMatches:{type:Number, default:0},
  tShirtNumber:{type:String, required:true},
  description:{type:String},
  arabicDescription:{type:String},
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
joueurSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Joueur", joueurSchema);

