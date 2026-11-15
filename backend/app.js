
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    "https://library-frontend-coral.vercel.app"
  ],
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ]
}));

// Middleware
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Error Handler / 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found"
  });
});

module.exports = app;
