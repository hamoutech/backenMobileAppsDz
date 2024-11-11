const mongoose = require("mongoose");
const URL1 = process.env.URL;
const connectDB = () => {
  try {
    mongoose.connect(URL1, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connexion à mongoDB est reussite");
  } catch (error) {
    console.log("Connexion à mongoDB a échouée");
  }
};
module.exports = connectDB;