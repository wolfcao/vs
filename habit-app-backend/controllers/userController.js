const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { sequelize } = require("../config/sequelize");
const { userStorage } = require("../config/memoryStorage");

// Check if MySQL is connected
const isDatabaseConnected = () => {
  return (
    sequelize.connectionManager &&
    sequelize.connectionManager._state !== "disconnected"
  );
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    let user;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      user = await User.findOne();

      if (!user) {
        // Create a sample user if no users exist
        user = await User.create({
          name: "Sample User",
          avatar:
            "https://thirdqq.qlogo.cn/ek_qqapp/AQVJKMtqeFCGNEZqicOj7qb7mnpcJiaZNlEOf0iasx2DicuEycbIG9cQktWUBxWR1dFWfLMI2Ilt/100",
        });
      }
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for user operations");
      user = await userStorage.findOne();

      if (!user) {
        // Create a sample user if no users exist
        user = await userStorage.create({
          name: "Sample User",
          avatar: "https://i.pravatar.cc/150?img=1",
        });
      }
    }

    // Convert Sequelize model to plain object if needed
    const userResponse = user.toJSON ? user.toJSON() : user;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update current user
exports.updateUser = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    let updatedUser;

    // Validate input
    if (!name && !avatar) {
      return res.status(400).json({
        message: "At least one field (name or avatar) is required for update",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      // Find current user by ID from request (from auth middleware)
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user
      updatedUser = await user.update(updateData);
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for user operations");
      updatedUser = await userStorage.update({ id: req.user.id }, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Convert Sequelize model to plain object if needed
    const userResponse = updatedUser.toJSON
      ? updatedUser.toJSON()
      : updatedUser;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, avatar } = req.body;

    // Validate input
    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, username, email, and password are required" });
    }

    // Check if user already exists
    if (isDatabaseConnected()) {
      const existingUser = await User.findOne({
        where: {
          [sequelize.Sequelize.Op.or]: [{ username }, { email }],
        },
      });
      if (existingUser) {
        if (existingUser.username === username) {
          return res
            .status(400)
            .json({ message: "User already exists with this username" });
        } else {
          return res
            .status(400)
            .json({ message: "User already exists with this email" });
        }
      }
    } else {
      const existingUserByUsername = await userStorage.findOne({ username });
      if (existingUserByUsername) {
        return res
          .status(400)
          .json({ message: "User already exists with this username" });
      }
      const existingUserByEmail = await userStorage.findOne({ email });
      if (existingUserByEmail) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    let newUser;
    if (isDatabaseConnected()) {
      newUser = await User.create({
        name,
        username,
        email,
        password: hashedPassword,
        avatar: avatar || "https://i.pravatar.cc/150?img=1",
        is_active: true,
        deleted_at: null,
      });
    } else {
      // Get max id from memory storage
      const users = await userStorage.findAll();
      const maxId = users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0;

      newUser = await userStorage.create({
        id: maxId + 1,
        name,
        username,
        email,
        password: hashedPassword,
        avatar: avatar || "https://i.pravatar.cc/150?img=1",
        is_active: true,
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Convert Sequelize model to plain object if needed
    const userResponse = newUser.toJSON ? newUser.toJSON() : newUser;
    // Remove password from response
    delete userResponse.password;

    // Generate JWT token
    const token = jwt.sign(
      { id: userResponse.id, username: userResponse.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find user
    let user;
    if (isDatabaseConnected()) {
      user = await User.scope("withPassword").findOne({
        where: {
          username,
          deleted_at: null,
        },
      });
    } else {
      user = await userStorage.findOne({ username });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (user.is_active === false) {
      return res.status(400).json({ message: "User account is disabled" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Convert Sequelize model to plain object if needed
    const userResponse = user.toJSON ? user.toJSON() : { ...user };
    // Remove password from response
    delete userResponse.password;

    // Generate JWT token
    const token = jwt.sign(
      { id: userResponse.id, username: userResponse.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
