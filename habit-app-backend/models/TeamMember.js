const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

const TeamMember = sequelize.define(
  "TeamMember",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM("idle", "active", "completed"),
      defaultValue: "idle",
    },
    active_habit_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "active_habits",
        key: "id",
      },
      allowNull: false,
    },
    approvalStatus: {
      type: DataTypes.SMALLINT,
      defaultValue: 0, // 0: 审批中, 1: 通过, -1: 拒绝
      validate: {
        isIn: [[-1, 0, 1]],
      },
    },
  },
  {
    tableName: "team_members",
    timestamps: true,
  }
);

module.exports = TeamMember;
