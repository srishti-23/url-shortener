const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JWT_SECRET = 'YOUR_SECRET_KEY';

const client = new OAuth2Client('293743201897-3luvrfqfc6ipgrjjgchsinrfkggsbvhr.apps.googleusercontent.com');

// Verify Google ID token
const verifyGoogleToken = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: '293743201897-3luvrfqfc6ipgrjjgchsinrfkggsbvhr.apps.googleusercontent.com',
  });
  return ticket.getPayload();
};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

// Google Sign-In Controller
const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    const googleUser = await verifyGoogleToken(idToken);

    // Check if the user exists in the database
    let user = await User.findOne({ googleId: googleUser.sub });

    if (!user) {
      // Register the user
      user = new User({
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      });
      await user.save();
    }

    // Generate a JWT token
    const token = generateToken(user);

    res.status(200).json({
      message: user.googleId ? 'Login successful' : 'Registration successful',
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Google token' });
  }
};

module.exports = {
  googleAuth,
};
