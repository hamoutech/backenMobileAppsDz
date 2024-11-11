import mongoose from "mongoose";

const clientSubscriptionSchema = new mongoose.Schema({
  clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required:true
  },
  clientPseudo: { type: String, required: true, },  
  carteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Carte",
    required:true
  },
  carteTitled: { type: String, required: true, },
  numberOfMatches: { type: Number, required: true },  
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
  isRenewable: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  creationDate: { type: String },
  clubName:{type:String},
  clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
  },
  createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
  },
});

module.exports = mongoose.model("ClientSubscription", clientSubscriptionSchema);
