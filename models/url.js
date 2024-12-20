const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    totalClicks: {
      type: Number,
      required: true,
      default: 0,
    },
    visitHistory: [
      new mongoose.Schema({
        // Define the structure of each subdocument here
        timestamp: { type: Date, required: true },
        action: { type: String },
      }),
    ],
  },
  { timeStamps: true }
);
const URL = mongoose.model("url", urlSchema);
module.exports = URL;
