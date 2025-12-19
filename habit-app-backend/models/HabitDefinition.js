const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const SubTask = require("./SubTask");

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
      allowNull: false,
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

module.exports = HabitDefinition;
