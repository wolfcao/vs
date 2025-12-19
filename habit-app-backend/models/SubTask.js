const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

const SubTask = sequelize.define(
  "SubTask",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    min_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    habit_definition_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "habit_definitions",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    tableName: "sub_tasks",
    timestamps: true,
  }
);

module.exports = SubTask;
