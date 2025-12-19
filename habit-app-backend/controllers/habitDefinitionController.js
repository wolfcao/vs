const HabitDefinition = require("../models/HabitDefinition");
const SubTask = require("../models/SubTask");
const { sequelize } = require("../config/sequelize");
const { habitDefinitionStorage } = require("../config/memoryStorage");

// Check if MySQL is connected
const isDatabaseConnected = () => {
  return (
    sequelize.connectionManager &&
    sequelize.connectionManager._state !== "disconnected"
  );
};

// Helper function to format habit response
const formatHabitResponse = (habit) => {
  // Convert Sequelize model to plain object if needed
  const habitObj = habit.toJSON ? habit.toJSON() : habit;

  // Transform snake_case to camelCase for consistency with frontend
  if (habitObj.required_team_size !== undefined) {
    habitObj.requiredTeamSize = habitObj.required_team_size;
    delete habitObj.required_team_size;
  }
  if (habitObj.duration_days !== undefined) {
    habitObj.durationDays = habitObj.duration_days;
    delete habitObj.duration_days;
  }
  if (habitObj.daily_start_time !== undefined) {
    habitObj.dailyStartTime = habitObj.daily_start_time;
    delete habitObj.daily_start_time;
  }
  if (habitObj.author_id !== undefined) {
    habitObj.authorId = habitObj.author_id;
    delete habitObj.author_id;
  }
  if (habitObj.created_at !== undefined) {
    habitObj.createdAt = habitObj.created_at;
    delete habitObj.created_at;
  }
  if (habitObj.updated_at !== undefined) {
    habitObj.updatedAt = habitObj.updated_at;
    delete habitObj.updated_at;
  }

  // Format dailyTasks
  if (habitObj.daily_tasks) {
    habitObj.dailyTasks = habitObj.daily_tasks.map((task) => ({
      id: task.id,
      name: task.name,
      minDurationMinutes: task.min_duration_minutes,
    }));
    delete habitObj.daily_tasks;
  }

  return habitObj;
};

// Get all habit definitions
exports.getAll = async (req, res) => {
  try {
    let habits;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      habits = await HabitDefinition.findAll({
        include: {
          model: SubTask,
          as: "daily_tasks",
        },
        order: [['created_at', 'DESC']] // Sort by creation time, newest first
      });
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for habit definition operations");
      habits = await habitDefinitionStorage.find();
      // Sort memory storage habits by createdAt, newest first
      habits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Add some sample habits if none exist
      if (habits.length === 0) {
        const sampleHabits = [
          {
            title: "Morning Yoga",
            description:
              "Start your day with 30 minutes of yoga for flexibility and mindfulness.",
            category: "health",
            requiredTeamSize: 2,
            durationDays: 30,
            dailyStartTime: "07:00",
            dailyTasks: [
              { id: "task-1", name: "Warm-up", minDurationMinutes: 10 },
              { id: "task-2", name: "Main poses", minDurationMinutes: 15 },
              { id: "task-3", name: "Cool-down", minDurationMinutes: 5 },
            ],
            authorId: "sample-author-id",
          },
          {
            title: "Daily Reading",
            description:
              "Read at least 20 minutes every day to expand your knowledge.",
            category: "learning",
            requiredTeamSize: 3,
            durationDays: 21,
            dailyStartTime: "20:00",
            dailyTasks: [
              { id: "task-1", name: "Reading", minDurationMinutes: 20 },
            ],
            authorId: "sample-author-id",
          },
        ];

        for (const sampleHabit of sampleHabits) {
          await habitDefinitionStorage.create(sampleHabit);
        }

        habits = await habitDefinitionStorage.find();
        // Sort again after adding sample habits
        habits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    // Format all habits for response
    const formattedHabits = habits.map(formatHabitResponse);

    res.status(200).json(formattedHabits);
  } catch (error) {
    console.error("Error getting all habits:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new habit definition
exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      requiredTeamSize,
      durationDays,
      dailyStartTime,
      dailyTasks,
    } = req.body;

    // For now, we'll use a sample authorId (1 corresponds to the sample user)
    const authorId = 1;

    let newHabit;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      // Start a transaction
      const transaction = await sequelize.transaction();

      try {
        // Create habit definition
        newHabit = await HabitDefinition.create(
          {
            title,
            description,
            category,
            required_team_size: requiredTeamSize,
            duration_days: durationDays,
            daily_start_time: dailyStartTime,
            author_id: authorId,
          },
          { transaction }
        );

        // Create associated sub tasks
        if (dailyTasks && dailyTasks.length > 0) {
          await SubTask.bulkCreate(
            dailyTasks.map((task) => ({
              name: task.name,
              min_duration_minutes: task.minDurationMinutes,
              habit_definition_id: newHabit.id,
            })),
            { transaction }
          );
        }

        // Commit transaction
        await transaction.commit();

        // Fetch the habit with its sub tasks
        newHabit = await HabitDefinition.findByPk(newHabit.id, {
          include: {
            model: SubTask,
            as: "daily_tasks",
          },
        });
        
        // Automatically create active habit for the author
        const user = await User.findByPk(authorId);
        if (user) {
          // Create active habit for the author
          await ActiveHabit.create({
            habit_definition_id: newHabit.id,
            habit_snapshot: newHabit.toJSON(),
            start_date: new Date(),
            my_logs: {},
            current_day: 1,
            has_modified_time_today: false,
            user_id: authorId,
            status: "active", // Creator is automatically in active status
          }, { transaction });
          
          // Create team member entry for the author
          await TeamMember.create({
            active_habit_id: (await ActiveHabit.findOne({
              where: { habit_definition_id: newHabit.id, user_id: authorId }
            })).id,
            user_id: authorId,
            name: user.name,
            avatar: user.avatar,
            progress: 0,
            status: "active",
          }, { transaction });
        }
      } catch (error) {
        // Rollback transaction if any error occurs
        await transaction.rollback();
        throw error;
      }
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for habit creation");
      newHabit = await habitDefinitionStorage.create({
        title,
        description,
        category,
        requiredTeamSize,
        durationDays,
        dailyStartTime,
        dailyTasks,
        authorId,
        createdAt: Date.now(),
      });
    }

    // Format the response
    const formattedHabit = formatHabitResponse(newHabit);

    res.status(201).json(formattedHabit);
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single habit definition by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    let habit;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      habit = await HabitDefinition.findByPk(id, {
        include: {
          model: SubTask,
          as: "daily_tasks",
        },
      });
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for habit retrieval");
      habit = await habitDefinitionStorage.findById(id);
    }

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Format the response
    const formattedHabit = formatHabitResponse(habit);

    res.status(200).json(formattedHabit);
  } catch (error) {
    console.error("Error getting habit by ID:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
