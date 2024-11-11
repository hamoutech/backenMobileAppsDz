import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    isShown: {
        type: Boolean,
        default: true,
    },
    image: ["path/to/image.jpg", "path/to/image.jpg"],
    video: {
        type: String,
    },
    location:{type:Number, required: true},
    duration:{type :String, required: true},
    creationDate: {
        type:String
    },
    modificationDate: {
        type:String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
    },
    editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
    },
});

module.exports = mongoose.model("Ad", adSchema);
