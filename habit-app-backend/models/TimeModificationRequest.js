const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

const TimeModificationRequest = sequelize.define(
  "TimeModificationRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    new_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approvals: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    active_habit_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "active_habits",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    tableName: "time_modification_requests",
    timestamps: true,
  }
);

module.exports = TimeModificationRequest;
