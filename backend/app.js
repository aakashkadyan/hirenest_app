const express = require("express");
const dotenv = require("dotenv")
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const User = require("./models/User");
const pinoHttp = require("pino-http");
const logger = require("./utils/logger");
const path = require("path");
const { loginRouter } = require("./routes/login");
const signUpRouter = require("./routes/signup");
const jobRoute = require("./routes/jobRoute");
const applicationRoute = require("./routes/applicationRoute");
const employerprofileRoute = require("./routes/employerprofileRoute");
const recommendationRoute = require("./routes/recommendationRoute");
const JobSeekerRoute = require("./routes/jobSeekerRoute");
const emailNotification = require("./routes/emailNotification");
const pino = require("pino");
dotenv.config();
// Initialize app
const app = express();
// ✅ CORS Configuration - Must be first
const corsOptions = {
  origin: [
    "https://hirenest-app.vercel.app" || process.env.FRONTEND_URL,
  ].filter(Boolean),  
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const httpLogger = pinoHttp({
  logger: pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname,req,res,responseTime',
        messageFormat: 'Method: {req.method} - URL: {req.url} - Status: {res.statusCode} - Time: {responseTime}ms'
      }
    }
  })
});
app.use(httpLogger);


app.get("/", (req, res) => {
  // Add a log here to easily test if logging is working
  req.log.info("Root endpoint hit successfully.");
  res.send(`
    <html>
    <head>
      <title>HireNest API</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        h1 { color: #333; }
        p { font-size: 18px; }
      </style>
    </head>
    <body>
      <h1>Welcome to HireNest API</h1>
      <p>API is running successfully!</p>
      <p>Visit our <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">frontend application</a>.</p>
    </body>
    </html> 
  `);
});

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Register routes immediately (not inside async function)
app.use("/api/jobs", jobRoute);
app.use("/api/applications", applicationRoute);
app.use("/api/employerprofile", employerprofileRoute);
app.use("/api/recommendation", recommendationRoute);
app.use("/api/jobseekers", JobSeekerRoute);
app.use("/api/send-email", emailNotification);
app.use("/api/email", emailNotification);
app.use("/api", signUpRouter);
app.use("/api", loginRouter);

// Error handler
app.use((err, req, res, next) => {
  req.logger.error("Error:", err.stack);
  res.status(500).send("Something broke!");
});

// 404 handler
app.use((req, res) => {
  req.log.error("404 - Not Found:", req.url);
  res.status(404).send("Page not found");
});

// ✅ Handle database connection based on environment
if (process.env.VERCEL) {
  // For Vercel: Connect immediately, don't wait (Mongoose buffers operations)
  connectDB().catch(err => {
    logger.error("Database connection failed:", err);
  });
} else {
  // For local development: Start server and connect to database
  const startLocalServer = async () => {
    try {
      // Connect to database first in local environment
      await connectDB();
      logger.info("Database connected successfully");

      const PORT = process.env.PORT || 5002;
      const server = app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
      });

      // Handle server errors
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          logger.error(`Port ${PORT} is already in use. Trying another port...`);
          const newPort = PORT + 1;
          app.listen(newPort, () => {
            logger.info(`Server running on port ${newPort} (fallback)`);
          });
        } else {
          logger.error("Server error:", err);
        }
      });

    } catch (error) {
      logger.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startLocalServer();
}

// Export the app for Vercel's serverless environment
module.exports = app;
