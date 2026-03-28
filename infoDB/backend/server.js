require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

// Connect to DB
connectDB();

// Starting the app
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log("Server is running on port " + port);
});

// Handling unhandled errors
process.on("unhandledRejection", (error) => {
  console.error("Error: ", error.message);
  server.close(() => process.exit(1));
});
