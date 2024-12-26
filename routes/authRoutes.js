const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Google Sign-In Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.json({
      message: "Authentication successful",
      token: token
    });
  }
);

module.exports = router;
