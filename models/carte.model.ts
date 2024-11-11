import mongoose from "mongoose";

const carteSchema = new mongoose.Schema({
  titled: { type: String,required:true },
  description: { type: String, required: true },
  image: ["path/to/image1.jpg", "path/to/image2.jpg"],
  numberOfMatches: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  duration: { type: Number, required: true },
  creationDate: { type: String },
  modificationDate: { type: String },
  clubName:{type:String},
  createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
  editedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
});

module.exports = mongoose.model("Carte", carteSchema);
