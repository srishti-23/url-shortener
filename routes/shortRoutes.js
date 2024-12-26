const express = require("express");
const URL = require("../models/url")
const redis = require("../config/redis");
const router = express.Router();
const ensureAuthenticated = require("../middleware/authmiddleware")
const { generateNewUrl, getAnalytics ,redirectShortUrl,getTopicBasedAnalytics,getOverallAnalytics} = require("../controllers/url");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again later.",
});
// Analytics Route
router.route("/shorten").post(limiter,  ensureAuthenticated,generateNewUrl)
router.get("/analytics/:alias", ensureAuthenticated, getAnalytics); 
router.get("/analytics/topic/:topic", ensureAuthenticated, getTopicBasedAnalytics); 
router.get("/analytic/overall", ensureAuthenticated, getOverallAnalytics); 
router.get('/shorten/:customAlias', redirectShortUrl);

module.exports = router;
