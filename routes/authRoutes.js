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
// );
// router.get("/auth/google/callback", async (req, res) => {
//   const { code } = req.query;

//   if (!code) {
//     return res.status(400).send("Authorization code not provided!");
//   }

//   try {
//     // Exchange the authorization code for an access token
//     const tokenResponse = await axios.post(
//       "https://oauth2.googleapis.com/token",
//       new URLSearchParams({
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         code,
//         grant_type: "authorization_code",
//         redirect_uri: "http://localhost:3000/auth/google/callback",
//       })
//     );

//     const { access_token, id_token } = tokenResponse.data;

//     // Use the access token or ID token to fetch user details
//     const userInfoResponse = await axios.get(
//       "https://www.googleapis.com/oauth2/v2/userinfo",
//       {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       }
//     );

//     const user = userInfoResponse.data;

//     // Log the user in or create an account
//     res.json({ user, access_token, id_token });
//   } catch (error) {
//     console.error("Error exchanging code for token:", error);
//     res.status(500).send("Error during Google OAuth callback.");
//   }
// });

module.exports = router;
