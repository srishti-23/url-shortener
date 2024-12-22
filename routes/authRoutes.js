const express = require("express");
const passport = require("passport");
const router = express.Router();

// Google Sign-In Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Redirect Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.status(200).json({ message: "Authentication successful", user: req.user });
  }
);

module.exports = router;
