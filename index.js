const dotenv = require("dotenv");
const envFile = "./.env";
dotenv.config({ path: envFile });
const express = require("express");
const session = require("express-session");
const urlRouter = require("./routes/shortRoutes");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const passport = require("passport");
require("./controllers/googleAuth");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 da
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/", authRoutes);
app.use("/api", urlRouter);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
