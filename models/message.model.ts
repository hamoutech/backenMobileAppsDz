import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  firstName: { type: String, required: true},
  lastName: { type: String, required: true},
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  message: { type: String, required: true},
  clubName: { type: String, required: true },
  phoneNumber:{type: String},
  createdDate:{type:String},
});

module.exports = mongoose.model("Message", messageSchema);
