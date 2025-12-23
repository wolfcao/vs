const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/sequelize");
const config = require("./config/config");

// Models (import all models to ensure associations are defined)
require("./models/User");
require("./models/SubTask");
require("./models/HabitDefinition");
require("./models/Category");
require("./models/TeamMember");
require("./models/TimeModificationRequest");
require("./models/ActiveHabit");

// Routes
const userRoutes = require("./routes/userRoutes");
const habitDefinitionRoutes = require("./routes/habitDefinitionRoutes");
const activeHabitRoutes = require("./routes/activeHabitRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Routes
app.use("/api/users", userRoutes);
app.use("/api/habits", habitDefinitionRoutes);
app.use("/api/active-habits", activeHabitRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Habit App API is running");
});

const PORT = config.port;

// Connect to MySQL and sync models
const startServer = async () => {
  try {
    // Authenticate with MySQL
    await sequelize.authenticate();
    console.log("MySQL connected...");

    // Database sync configuration
    // For all environments, use force: false to prevent data loss
    // alter: false means no automatic schema changes
    await sequelize.sync({ force: false, alter: false });
    console.log(`Database connected (${config.nodeEnv} mode)...`);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection or sync error:", error.message);
    console.error(
      "The server will continue running, but database operations may fail."
    );
    console.error(
      "Please ensure MySQL is installed and running with correct credentials."
    );

    // Start server anyway for fallback functionality
    app.listen(PORT, () => {
      console.log(
        `Server running in ${config.nodeEnv} mode on port ${PORT} (database fallback mode)`
      );
    });
  }
};

// Start the server
startServer();
