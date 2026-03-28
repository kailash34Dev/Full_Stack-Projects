const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler");
const apiRoutes = require("./routes/index");
const app = express();

// Middlewares;
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
);

app.use(express.json());

// API Routes
app.use("/", apiRoutes);

// Error Handling
app.use(errorHandler);

module.exports = app;
