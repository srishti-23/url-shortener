const mongoose = require("mongoose");
const visitHistorySchema= new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
 osName: { type: String, required: true },
  deviceName: { type: String, required: true },
  userId: { type: String, required: true },
  action: { type: String },
})

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
    visitHistory:[visitHistorySchema]
    ,
  },
  { timestamps: true }
);

const URL = mongoose.model("URL", urlSchema);
module.exports = URL;
