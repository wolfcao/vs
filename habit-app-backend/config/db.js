const mongoose = require("mongoose");
const config = require("./config");

// Fix strictQuery deprecation warning
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
    });
    console.log("MongoDB Connected...");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error(
      "MongoDB operations will be unavailable. Please ensure MongoDB is installed and running."
    );
    return false;
  }
};

// Export connection state checker
const isDatabaseConnected = () => {
  // Only readyState 1 means fully connected
  // 0 = disconnected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.isDatabaseConnected = isDatabaseConnected;
