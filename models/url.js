const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    longUrl: {
      type: String,
      required: [true, "Path `longUrl` is required."],
    },
    shortId: {
      type: String,
      unique: true,
      required: true,
    },
    customAlias: {
      type: String,
      unique: true,
    },
    topic: {
      type: String,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    visitHistory: [
      {
        timestamp: { type: Date, required: true },
        action: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const URL = mongoose.model("URL", urlSchema);
module.exports = URL;
