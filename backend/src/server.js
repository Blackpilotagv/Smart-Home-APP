require("dotenv").config();

const express = require("express");
const cors = require("cors");

// ============================
// ROUTES
// ============================

const authRoutes =
  require("./routes/authRoutes");

// ============================
// DATABASE
// ============================

const connectDB =
  require("./config/db");

// ============================
// EXPRESS APP
// ============================

const app = express();

// ============================
// CONNECT DATABASE
// ============================

connectDB();

// ============================
// MIDDLEWARE
// ============================

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ============================
// ROUTES
// ============================

app.use(
  "/api/auth",
  authRoutes
);

// ============================
// TEST ROUTE
// ============================

app.get("/", (req, res) => {

  res.json({

    success: true,

    message:
      "HomeOS Backend Running",

  });
});

// ============================
// START SERVER
// ============================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);