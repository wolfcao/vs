const ActiveHabit = require("../models/ActiveHabit");
const HabitDefinition = require("../models/HabitDefinition");
const User = require("../models/User");
const TeamMember = require("../models/TeamMember");
const TimeModificationRequest = require("../models/TimeModificationRequest");
const { sequelize } = require("../config/sequelize");
const {
  activeHabitStorage,
  habitDefinitionStorage,
  userStorage,
} = require("../config/memoryStorage");

// Check if MySQL is connected
const isDatabaseConnected = () => {
  return (
    sequelize.connectionManager &&
    sequelize.connectionManager._state !== "disconnected"
  );
};

// Helper function to format active habit response
const formatActiveHabitResponse = (activeHabit) => {
  // Handle null or undefined activeHabit
  if (!activeHabit) {
    throw new Error("Active habit not found or not created");
  }

  // Convert Sequelize model to plain object if needed
  const habitObj = activeHabit.toJSON ? activeHabit.toJSON() : activeHabit;

  // Transform snake_case to camelCase for consistency with frontend
  if (habitObj.habit_definition_id !== undefined) {
    habitObj.habitDefinitionId = habitObj.habit_definition_id;
    delete habitObj.habit_definition_id;
  }
  if (habitObj.habit_snapshot !== undefined) {
    let habitSnapshot = habitObj.habit_snapshot;

    // If habitSnapshot is a string, parse it to an object
    if (typeof habitSnapshot === "string") {
      try {
        habitSnapshot = JSON.parse(habitSnapshot);
      } catch (error) {
        console.error("Error parsing habitSnapshot:", error);
        habitSnapshot = {};
      }
    }

    habitObj.habitSnapshot = habitSnapshot;
    delete habitObj.habit_snapshot;

    // Transform habitSnapshot fields
    const snapshot = habitObj.habitSnapshot;
    if (snapshot) {
      // Ensure title exists
      if (!snapshot.title) {
        snapshot.title = "未命名习惯";
      }

      if (snapshot.required_team_size !== undefined) {
        snapshot.requiredTeamSize = snapshot.required_team_size;
        delete snapshot.required_team_size;
      }
      if (snapshot.duration_days !== undefined) {
        snapshot.durationDays = snapshot.duration_days;
        delete snapshot.duration_days;
      }
      if (snapshot.daily_start_time !== undefined) {
        snapshot.dailyStartTime = snapshot.daily_start_time;
        delete snapshot.daily_start_time;
      }
      if (snapshot.daily_tasks !== undefined) {
        snapshot.dailyTasks = snapshot.daily_tasks.map((task) => ({
          id: task.id,
          name: task.name,
          minDurationMinutes: task.min_duration_minutes,
        }));
        delete snapshot.daily_tasks;
      }
      if (snapshot.author_id !== undefined) {
        snapshot.authorId = snapshot.author_id;
        delete snapshot.author_id;
      }
      if (snapshot.created_at !== undefined) {
        snapshot.createdAt = snapshot.created_at;
        delete snapshot.created_at;
      }
    }
  }
  if (habitObj.start_date !== undefined) {
    habitObj.startDate = habitObj.start_date;
    delete habitObj.start_date;
  }
  if (habitObj.my_logs !== undefined) {
    habitObj.myLogs = habitObj.my_logs;
    delete habitObj.my_logs;
  }
  if (habitObj.current_day !== undefined) {
    habitObj.currentDay = habitObj.current_day;
    delete habitObj.current_day;
  }
  if (habitObj.has_modified_time_today !== undefined) {
    habitObj.hasModifiedTimeToday = habitObj.has_modified_time_today;
    delete habitObj.has_modified_time_today;
  }
  if (habitObj.user_id !== undefined) {
    habitObj.userId = habitObj.user_id;
    delete habitObj.user_id;
  }
  if (habitObj.created_at !== undefined) {
    habitObj.createdAt = habitObj.created_at;
    delete habitObj.created_at;
  }
  if (habitObj.updated_at !== undefined) {
    habitObj.updatedAt = habitObj.updated_at;
    delete habitObj.updated_at;
  }

  // Format members
  if (habitObj.team_members) {
    habitObj.members = habitObj.team_members.map((member) => ({
      userId: member.user_id,
      name: member.name,
      avatar: member.avatar,
      progress: member.progress || 0,
      status: member.status,
      approvalStatus: member.approval_status || member.approvalStatus || 0,
    }));
    delete habitObj.team_members;
  } else if (habitObj.members) {
    // Members are already included as 'members' from Sequelize include
    habitObj.members = habitObj.members.map((member) => ({
      userId: member.user_id || member.userId,
      name: member.name,
      avatar: member.avatar,
      progress: member.progress || 0,
      status: member.status,
      approvalStatus: member.approval_status || member.approvalStatus || 0,
    }));
  }

  // Ensure myLogs exists and has proper structure
  if (!habitObj.myLogs) {
    habitObj.myLogs = {};
  }

  // Convert string myLogs to object if needed
  if (typeof habitObj.myLogs === "string") {
    try {
      habitObj.myLogs = JSON.parse(habitObj.myLogs);
    } catch (error) {
      console.error("Error parsing myLogs:", error);
      habitObj.myLogs = {};
    }
  }

  // Format time modification requests
  if (habitObj.time_modification_requests) {
    habitObj.timeModificationRequests = habitObj.time_modification_requests.map(
      (request) => ({
        date: request.date,
        newTime: request.new_time,
        approvals: request.approvals,
        status: request.status,
      })
    );
    delete habitObj.time_modification_requests;
  }

  return habitObj;
};

// Get all active habits
exports.getAll = async (req, res) => {
  try {
    let activeHabits;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      activeHabits = await ActiveHabit.findAll({
        include: [
          {
            model: TeamMember,
            as: "members",
          },
          {
            model: TimeModificationRequest,
            as: "time_modification_requests",
          },
        ],
      });
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for active habit operations");
      activeHabits = await activeHabitStorage.find();

      // Add sample active habits if none exist
      if (activeHabits.length === 0) {
        console.log("Adding sample active habits to memory storage");

        // Get a sample habit definition to associate with active habits
        const habitDefinitions = await habitDefinitionStorage.find();
        if (habitDefinitions.length > 0) {
          const sampleHabit = habitDefinitions[0];
          const sampleUser = await userStorage.findOne();

          if (sampleUser) {
            // Create a sample active habit
            const activeHabit = await activeHabitStorage.create({
              habitDefinitionId: sampleHabit.id,
              habitSnapshot: sampleHabit,
              members: [
                {
                  userId: sampleUser.id,
                  name: sampleUser.name,
                  avatar: sampleUser.avatar,
                  progress: 50,
                  status: "active",
                },
              ],
              myLogs: {},
              startDate: Date.now(),
              currentDay: 1,
              hasModifiedTimeToday: false,
              timeModificationRequests: [],
            });

            // Initialize task logs
            const myLogs = {};
            if (sampleHabit.dailyTasks) {
              sampleHabit.dailyTasks.forEach((task) => {
                myLogs[task.id] = {
                  subTaskId: task.id,
                  elapsedSeconds: 0,
                  isRunning: false,
                  isCompleted: false,
                  startTime: null,
                };
              });
            }

            await activeHabitStorage.findByIdAndUpdate(activeHabit.id, {
              myLogs,
            });

            // Refresh the list
            activeHabits = await activeHabitStorage.find();
          }
        }
      }
    }

    // Format all active habits for response
    const formattedActiveHabits = activeHabits.map(formatActiveHabitResponse);

    res.status(200).json(formattedActiveHabits);
  } catch (error) {
    console.error("Error getting active habits:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Join a habit
exports.joinHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    let activeHabit = null;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      // Get the habit definition with its sub tasks
      const habitDefinition = await HabitDefinition.findByPk(habitId, {
        include: { all: true },
      });
      if (!habitDefinition) {
        return res.status(404).json({ message: "Habit not found" });
      }

      // Get the current user from JWT token
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is already in an active habit for this definition
      const userInActiveHabit = await TeamMember.findOne({
        include: {
          model: ActiveHabit,
          as: "active_habit",
        },
        where: {
          user_id: user.id,
          "$active_habit.habit_definition_id$": habitId,
        },
        raw: true,
        nest: true,
      });

      if (userInActiveHabit) {
        return res
          .status(400)
          .json({ message: "You are already in this habit" });
      }

      // Check if there's an existing active habit with space for more members
      const activeHabits = await ActiveHabit.findAll({
        include: {
          model: TeamMember,
          as: "members",
        },
        where: { habit_definition_id: habitId },
      });

      // Find an active habit that's not full
      for (const habit of activeHabits) {
        const memberCount = habit.members.length;
        if (memberCount < habitDefinition.required_team_size) {
          activeHabit = habit;
          break;
        }
      }

      const transaction = await sequelize.transaction();

      try {
        if (activeHabit) {
          // Add user to existing active habit
          await TeamMember.create(
            {
              user_id: user.id,
              name: user.name,
              avatar: user.avatar,
              progress: 0,
              status: "idle",
              active_habit_id: activeHabit.id,
              approvalStatus: 0, // 0: 审批中
            },
            { transaction }
          );

          // Fetch the updated active habit
          activeHabit = await ActiveHabit.findByPk(activeHabit.id, {
            include: [
              {
                model: TeamMember,
                as: "members",
              },
              {
                model: TimeModificationRequest,
                as: "time_modification_requests",
              },
            ],
          });
        } else {
          // Create a new active habit
          // Convert habit definition to snapshot (camelCase for frontend compatibility)
          const habitSnapshot = {
            id: habitDefinition.id,
            title: habitDefinition.title,
            description: habitDefinition.description,
            category: habitDefinition.category,
            requiredTeamSize: habitDefinition.required_team_size,
            durationDays: habitDefinition.duration_days,
            dailyStartTime: habitDefinition.daily_start_time,
            dailyTasks: habitDefinition.daily_tasks
              ? habitDefinition.daily_tasks.map((task) => ({
                  id: task.id,
                  name: task.name,
                  minDurationMinutes: task.min_duration_minutes,
                }))
              : [],
            authorId: habitDefinition.author_id,
            createdAt: habitDefinition.created_at,
          };

          // Create active habit
          const newActiveHabit = await ActiveHabit.create(
            {
              habit_definition_id: habitId,
              user_id: user.id,
              habit_snapshot: habitSnapshot,
              start_date: new Date(),
              my_logs: {},
              current_day: 1,
              has_modified_time_today: false,
            },
            { transaction }
          );

          // Add user as the first member
          await TeamMember.create(
            {
              user_id: user.id,
              name: user.name,
              avatar: user.avatar,
              progress: 0,
              status: "idle",
              active_habit_id: newActiveHabit.id,
              approvalStatus: 1, // 1: 已通过（创建者自动通过）
            },
            { transaction }
          );

          // Initialize task logs for each subtask
          const myLogs = {};
          if (habitDefinition.daily_tasks) {
            habitDefinition.daily_tasks.forEach((task) => {
              myLogs[task.id] = {
                subTaskId: task.id,
                elapsedSeconds: 0,
                isRunning: false,
                isCompleted: false,
                startTime: null,
              };
            });
          }

          // Update the active habit with initialized logs
          await newActiveHabit.update({ my_logs: myLogs }, { transaction });

          // Fetch the complete active habit with relations
          activeHabit = await ActiveHabit.findByPk(newActiveHabit.id, {
            include: [
              {
                model: TeamMember,
                as: "members",
              },
              {
                model: TimeModificationRequest,
                as: "time_modification_requests",
              },
            ],
          });
        }

        // Commit transaction
        await transaction.commit();
      } catch (error) {
        // Rollback transaction if any error occurs
        await transaction.rollback();
        console.error("Error in transaction:", error);
        res.status(500).json({ message: "Server Error" });
        return;
      }
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for join habit operation");

      // Get habit definition from memory storage
      const habitDefinition = await habitDefinitionStorage.findById(habitId);
      if (!habitDefinition) {
        return res.status(404).json({ message: "Habit not found" });
      }

      // Get current user from memory storage
      const user = await userStorage.findOne();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is already in this habit
      const activeHabits = await activeHabitStorage.find();
      let userInActiveHabit = false;

      for (const habit of activeHabits) {
        if (habit.habitDefinitionId === habitId) {
          if (
            habit.members &&
            habit.members.some((member) => member.userId === user.id)
          ) {
            userInActiveHabit = true;
            break;
          }
        }
      }

      if (userInActiveHabit) {
        return res
          .status(400)
          .json({ message: "You are already in this habit" });
      }

      // Find an existing active habit that's not full
      for (const habit of activeHabits) {
        if (habit.habitDefinitionId === habitId) {
          const memberCount = habit.members ? habit.members.length : 0;
          if (memberCount < habitDefinition.requiredTeamSize) {
            // Add user to existing habit
            if (!habit.members) {
              habit.members = [];
            }
            habit.members.push({
              userId: user.id,
              name: user.name,
              avatar: user.avatar,
              progress: 0,
              status: "idle",
            });
            activeHabit = habit;
            break;
          }
        }
      }

      if (!activeHabit) {
        // Create a new active habit with memory storage
        const habitSnapshot = {
          ...habitDefinition,
        };

        // Initialize task logs for each subtask
        const myLogs = {};
        if (habitDefinition.dailyTasks) {
          habitDefinition.dailyTasks.forEach((task) => {
            myLogs[task.id] = {
              subTaskId: task.id,
              elapsedSeconds: 0,
              isRunning: false,
              isCompleted: false,
              startTime: null,
            };
          });
        }

        activeHabit = await activeHabitStorage.create({
          habitDefinitionId: habitId,
          habitSnapshot,
          members: [
            {
              userId: user.id,
              name: user.name,
              avatar: user.avatar,
              progress: 0,
              status: "idle",
            },
          ],
          myLogs,
          startDate: Date.now(),
          currentDay: 1,
          hasModifiedTimeToday: false,
          timeModificationRequests: [],
        });
      }
    }

    // Format the response
    const formattedActiveHabit = formatActiveHabitResponse(activeHabit);

    res.status(201).json(formattedActiveHabit);
  } catch (error) {
    console.error("Error joining habit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle timer for a subtask
exports.toggleTimer = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res
        .status(503)
        .json({ message: "Database unavailable. Please try again later." });
    }

    const { activeHabitId, subTaskId } = req.params;

    const activeHabit = await ActiveHabit.findByPk(activeHabitId);
    if (!activeHabit) {
      return res.status(404).json({ message: "Active habit not found" });
    }

    // Get the current time log for this subtask
    let myLogs = activeHabit.my_logs || {};
    let taskLog = myLogs[subTaskId];

    if (!taskLog) {
      // Create a new log if it doesn't exist
      taskLog = {
        subTaskId,
        elapsedSeconds: 0,
        isRunning: false,
        isCompleted: false,
        startTime: null,
      };
      myLogs[subTaskId] = taskLog;
    }

    if (taskLog.isRunning) {
      // Stop the timer
      const now = Date.now();
      const elapsed = Math.floor((now - taskLog.startTime) / 1000);
      taskLog.elapsedSeconds += elapsed;
      taskLog.isRunning = false;
      taskLog.startTime = null;
    } else {
      // Start the timer
      taskLog.isRunning = true;
      taskLog.startTime = Date.now();
    }

    // Update the active habit
    await activeHabit.update({ my_logs: myLogs });

    // Fetch the updated active habit with relations
    const updatedActiveHabit = await ActiveHabit.findByPk(activeHabitId, {
      include: [
        {
          model: TeamMember,
          as: "members",
        },
        {
          model: TimeModificationRequest,
          as: "time_modification_requests",
        },
      ],
    });

    // Format the response
    const formattedActiveHabit = formatActiveHabitResponse(updatedActiveHabit);

    res.status(200).json(formattedActiveHabit);
  } catch (error) {
    console.error("Error toggling timer:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Complete a task
exports.completeTask = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res
        .status(503)
        .json({ message: "Database unavailable. Please try again later." });
    }

    const { activeHabitId, subTaskId } = req.params;

    const activeHabit = await ActiveHabit.findByPk(activeHabitId);
    if (!activeHabit) {
      return res.status(404).json({ message: "Active habit not found" });
    }

    // Get the current time log for this subtask
    let myLogs = activeHabit.my_logs || {};
    let taskLog = myLogs[subTaskId];

    if (!taskLog) {
      // Create a new log if it doesn't exist
      taskLog = {
        subTaskId,
        elapsedSeconds: 0,
        isRunning: false,
        isCompleted: false,
        startTime: null,
      };
      myLogs[subTaskId] = taskLog;
    }

    // Stop the timer if it's running
    if (taskLog.isRunning) {
      const now = Date.now();
      const elapsed = Math.floor((now - taskLog.startTime) / 1000);
      taskLog.elapsedSeconds += elapsed;
      taskLog.isRunning = false;
      taskLog.startTime = null;
    }

    // Mark task as completed
    taskLog.isCompleted = true;

    // Update user's progress
    const user = await User.findOne();
    if (user) {
      // Get team member
      const teamMember = await TeamMember.findOne({
        where: {
          user_id: user.id,
          active_habit_id: activeHabit.id,
        },
      });

      if (teamMember) {
        // Calculate new progress based on completed tasks
        const completedTasks = Object.values(myLogs).filter(
          (log) => log.isCompleted
        ).length;
        const totalTasks = Object.keys(myLogs).length;
        const progress =
          totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;

        // Update status if all tasks are completed
        let status = "active";
        if (progress === 100) {
          status = "completed";
        } else if (progress === 0) {
          status = "idle";
        }

        // Update team member
        await teamMember.update({
          progress,
          status,
        });
      }
    }

    // Update the active habit
    await activeHabit.update({ my_logs: myLogs });

    // Fetch the updated active habit with relations
    const updatedActiveHabit = await ActiveHabit.findByPk(activeHabitId, {
      include: [
        {
          model: TeamMember,
          as: "members",
        },
        {
          model: TimeModificationRequest,
          as: "time_modification_requests",
        },
      ],
    });

    // Format the response
    const formattedActiveHabit = formatActiveHabitResponse(updatedActiveHabit);

    res.status(200).json(formattedActiveHabit);
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Request a time change
exports.requestTimeChange = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res
        .status(503)
        .json({ message: "Database unavailable. Please try again later." });
    }

    const { activeHabitId } = req.params;
    const { newTime } = req.body;

    const activeHabit = await ActiveHabit.findByPk(activeHabitId);
    if (!activeHabit) {
      return res.status(404).json({ message: "Active habit not found" });
    }

    // Check if user has already modified time today
    if (activeHabit.has_modified_time_today) {
      return res
        .status(400)
        .json({ message: "You have already modified time today" });
    }

    // Get the current user
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new time modification request
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const transaction = await sequelize.transaction();

    try {
      // Create time modification request
      await TimeModificationRequest.create(
        {
          date: today,
          new_time: newTime,
          approvals: [user.id],
          status: "pending",
          active_habit_id: activeHabitId,
        },
        { transaction }
      );

      // Update active habit
      await activeHabit.update(
        {
          has_modified_time_today: true,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      res.status(200).json({ success: true });
    } catch (error) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      console.error("Error in transaction:", error);
      res.status(500).json({ message: "Server Error" });
    }
  } catch (error) {
    console.error("Error requesting time change:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single active habit by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    let activeHabit;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      activeHabit = await ActiveHabit.findByPk(id, {
        include: [
          {
            model: TeamMember,
            as: "members",
          },
          {
            model: TimeModificationRequest,
            as: "time_modification_requests",
          },
        ],
      });
    } else {
      // Use memory storage as fallback
      activeHabit = await activeHabitStorage.findById(id);
    }

    if (!activeHabit) {
      return res.status(404).json({ message: "Active habit not found" });
    }

    // Format the response
    const formattedActiveHabit = formatActiveHabitResponse(activeHabit);

    res.status(200).json(formattedActiveHabit);
  } catch (error) {
    console.error("Error getting active habit by ID:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Approve a join request
exports.approveJoinRequest = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res
        .status(503)
        .json({ message: "Database unavailable. Please try again later." });
    }

    const { activeHabitId, userId } = req.params;

    // Update the team member's approval status to approved
    const updatedMember = await TeamMember.update(
      { approvalStatus: 1, status: "active" },
      { where: { user_id: userId, active_habit_id: activeHabitId } }
    );

    if (updatedMember[0] === 0) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({ message: "Join request approved", success: true });
  } catch (error) {
    console.error("Error approving join request:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reject a join request
exports.rejectJoinRequest = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res
        .status(503)
        .json({ message: "Database unavailable. Please try again later." });
    }

    const { activeHabitId, userId } = req.params;

    // Update the team member's approval status to rejected
    const updatedMember = await TeamMember.update(
      { approvalStatus: -1 },
      { where: { user_id: userId, active_habit_id: activeHabitId } }
    );

    if (updatedMember[0] === 0) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({ message: "Join request rejected", success: true });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
