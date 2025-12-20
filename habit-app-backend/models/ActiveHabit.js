const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");
const TeamMember = require("./TeamMember");
const TimeModificationRequest = require("./TimeModificationRequest");
const HabitDefinition = require("./HabitDefinition");
const Category = require("./Category");

const ActiveHabit = sequelize.define(
  "ActiveHabit",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    habit_definition_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "habit_definitions",
        key: "id",
      },
      allowNull: false,
    },
    habit_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    my_logs: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    current_day: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    has_modified_time_today: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active'),
      defaultValue: 'pending',
    },
  },
  {
    tableName: "active_habits",
    timestamps: true,
  }
);

// Define relationships
ActiveHabit.hasMany(TeamMember, {
  foreignKey: "active_habit_id",
  as: "members",
});

TeamMember.belongsTo(ActiveHabit, {
  foreignKey: "active_habit_id",
  as: "active_habit",
});

ActiveHabit.hasMany(TimeModificationRequest, {
  foreignKey: "active_habit_id",
  as: "time_modification_requests",
});

TimeModificationRequest.belongsTo(ActiveHabit, {
  foreignKey: "active_habit_id",
  as: "active_habit",
});

ActiveHabit.belongsTo(HabitDefinition, {
  foreignKey: "habit_definition_id",
  as: "habit_definition",
});

module.exports = ActiveHabit;
