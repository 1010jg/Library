const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Error Handler / 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

module.exports = app;
