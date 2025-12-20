const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const SubTask = require("./SubTask");
const User = require("./User");
const Category = require("./Category");

const HabitDefinition = sequelize.define(
  "HabitDefinition",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("health", "learning", "creativity", "productivity"),
      allowNull: true, // Set to nullable for backward compatibility
    },
    required_team_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[2, 3, 4]],
      },
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    daily_start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "habit_definitions",
    timestamps: true,
    createdAt: "created_at",
  }
);

// Define relationship with SubTask
HabitDefinition.hasMany(SubTask, {
  foreignKey: "habit_definition_id",
  as: "daily_tasks",
});

SubTask.belongsTo(HabitDefinition, {
  foreignKey: "habit_definition_id",
  as: "habit_definition",
});

// Define relationship with User (author)
HabitDefinition.belongsTo(User, {
  foreignKey: "author_id",
  as: "author",
});

// Define many-to-many relationship with Category
// This creates a habit_definition_categories join table
HabitDefinition.belongsToMany(Category, {
  through: 'habit_definition_categories',
  as: 'categories',
  foreignKey: 'habit_definition_id',
  otherKey: 'category_id'
});

Category.belongsToMany(HabitDefinition, {
  through: 'habit_definition_categories',
  as: 'habit_definitions',
  foreignKey: 'category_id',
  otherKey: 'habit_definition_id'
});

module.exports = HabitDefinition;
