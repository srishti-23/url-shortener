const express = require("express");
const session = require("express-session");
const urlRouter = require("./routes/shortRoutes");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors=require("cors")
const authRoutes = require("./routes/authRoutes");
const URL = require("./models/url");
const passport = require("passport");
require("./controllers/googleAuth");
const app = express();

app.use(express.json());
app.use(cors())
app.use(bodyParser.json());

app.use(
  session({
    secret: "your_secret_key", // Replace with a secure secret key
    resave: false, // Prevents saving session if not modified
    saveUninitialized: false, // Prevents storing uninitialized sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoutes);
app.use("/api", urlRouter);

connectDB();

const PORT = process.env.PORT || 5000;



// app.get('/:shortId', async (req, res) => {
//     const shortId = req.params.shortId;

//     try {
//         // Find the URL entry based on shortId
//         const entry = await URL.findOneAndUpdate(
//             { shortId },
//             { $push: { visitHistory: { timestamp: new Date(), action: 'visited' } } },
//             { new: true } // Return the updated document
//         );

//         if (!entry) {
//             return res.status(404).send('Short URL not found');
//         }

//         // Redirect to the original URL
//         res.redirect(entry.redirectUrl);
//     } catch (error) {
//         console.error('Error processing request:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
