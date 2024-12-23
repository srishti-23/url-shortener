const express = require("express");
const URL = require("../models/url");
const redis = require("../config/redis");
const router = express.Router();

// Ensure the correct import path for the controllers
const { generateNewUrl, getAnalytics ,redirectShortUrl,getTopicBasedAnalytics,getOverallAnalytics} = require("../controllers/url");

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again later.",
});

 // Ensure generateNewUrl is passed correctly

// Redirect Short URL
// router.get("/:customAlias", async (req, res) => {
//     const { alias } = req.params;

//     console.log("Received alias:", alias);

//     try {
//         let url = await redis.get(alias.trim());
//         console.log("Redis cache for alias:", url);

//         if (!url) {
//             console.log("Redis miss. Checking database for alias:", alias.trim());
//             url = await URL.findOne({ customAlias: alias.trim() });
//             console.log("Database result for alias:", url);

//             if (!url) {
//                 return res.status(404).json({ error: "Short URL not found" });
//             }

//             await redis.set(alias.trim(), JSON.stringify(url));
//         } else {
//             url = JSON.parse(url);
//         }

//         // Log analytics
//         if (url.visitHistory) {
//             url.visitHistory.push({ timestamp: new Date(), action: "redirect" });
//             await url.save();
//         } else {
//             console.error("Visit history not initialized for alias:", alias);
//         }

//         res.redirect(url.longUrl);
//     } catch (error) {
//         console.error("Error in GET /:alias:", error);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// Analytics Route
router.route("/shorten").post(limiter, generateNewUrl)
router.get('/shorten/:customAlias', redirectShortUrl);
router.get("/analytics/:alias", getAnalytics); // Ensure getAnalytics is passed correctly
router.get("/analytics/topic/:topic", getTopicBasedAnalytics); // Ensure getAnalytics is passed correctly
router.get("/analytic/overall", getOverallAnalytics); // Ensure getAnalytics is passed correctly

module.exports = router;
