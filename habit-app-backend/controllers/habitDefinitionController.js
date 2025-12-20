const HabitDefinition = require("../models/HabitDefinition");
const SubTask = require("../models/SubTask");
const ActiveHabit = require("../models/ActiveHabit");
const TeamMember = require("../models/TeamMember");
const User = require("../models/User");
const Category = require("../models/Category");
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

  // Add author name to the response
  if (habitObj.author && habitObj.author.name) {
    habitObj.authorName = habitObj.author.name;
    delete habitObj.author;
  } else if (!habitObj.authorName) {
    // For all habits without author name, set a default
    habitObj.authorName = '习惯达人';
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

  // Format categories
  if (habitObj.categories) {
    habitObj.categories = habitObj.categories.map((category) => category.name);
  } else if (habitObj.category) {
    // For backward compatibility with existing habits that have single category
    habitObj.categories = [habitObj.category];
    delete habitObj.category;
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
        include: [
          {
            model: SubTask,
            as: "daily_tasks",
          },
          {
            model: User,
            as: "author",
            attributes: ['name'], // Only get the author's name
          },
          {
            model: Category,
            as: "categories",
            attributes: ['name'], // Only get the category name
          }
        ],
        order: [["created_at", "DESC"]], // Sort by creation time, newest first
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

    // Add current user ID to response so frontend can determine which habits are created by the current user
    const responseData = {
      habits: formattedHabits,
      currentUserId: req.user?.id || null,
    };

    res.status(200).json(responseData);
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
      categories,
      requiredTeamSize,
      durationDays,
      dailyStartTime,
      dailyTasks,
    } = req.body;

    // Use the current logged-in user's ID as the authorId
    const authorId = req.user.id;

    let newHabit;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      // Start a transaction
      const transaction = await sequelize.transaction();
      let habitId;

      try {
        // Create habit definition without categories first
        const habit = await HabitDefinition.create(
          {
            title,
            description,
            required_team_size: requiredTeamSize,
            duration_days: durationDays,
            daily_start_time: dailyStartTime,
            author_id: authorId,
          },
          { transaction }
        );
        habitId = habit.id;

        // Create associated sub tasks
        if (dailyTasks && dailyTasks.length > 0) {
          await SubTask.bulkCreate(
            dailyTasks.map((task) => ({
              name: task.name,
              min_duration_minutes: task.minDurationMinutes,
              habit_definition_id: habitId,
            })),
            { transaction }
          );
        }

        // Process categories - find or create each category
        const categoryObjects = [];
        for (const categoryName of categories) {
          // Find or create category
          const [category, created] = await Category.findOrCreate({
            where: { name: categoryName },
            defaults: { usageCount: 1 },
            transaction
          });
          
          // Increment usage count if it already existed
          if (!created) {
            await category.increment('usageCount', { by: 1, transaction });
          }
          
          categoryObjects.push(category);
        }
        
        // Associate categories with habit
        await habit.setCategories(categoryObjects, { transaction });

        // Automatically create active habit for the author
        const user = await User.findByPk(authorId, { transaction });
        if (user) {
          // Get the habit with categories for the snapshot
          const habitWithCategories = await HabitDefinition.findByPk(habitId, {
            include: [
              { model: Category, as: 'categories', attributes: ['name'] }
            ],
            transaction
          });
          
          // Create active habit for the author
          const activeHabit = await ActiveHabit.create(
            {
              habit_definition_id: habitId,
              habit_snapshot: habitWithCategories.toJSON(),
              start_date: new Date(),
              my_logs: {},
              current_day: 1,
              has_modified_time_today: false,
              user_id: authorId,
              status: "active", // Creator is automatically in active status
            },
            { transaction }
          );

          // Create team member entry for the author
          await TeamMember.create(
            {
              active_habit_id: activeHabit.id,
              user_id: authorId,
              name: user.name,
              avatar: user.avatar,
              progress: 0,
              status: "active",
              approval_status: 1, // Creator is automatically approved
            },
            { transaction }
          );
        }

        // Commit transaction first
        await transaction.commit();

        // Fetch the habit with its sub tasks and categories after transaction is committed
        newHabit = await HabitDefinition.findByPk(habitId, {
          include: [
            {
              model: SubTask,
              as: "daily_tasks",
            },
            {
              model: Category,
              as: "categories",
              attributes: ['name'],
            }
          ],
        });
      } catch (error) {
        // Rollback transaction if it's still active
        if (transaction.finished !== "commit") {
          await transaction.rollback();
        }
        throw error;
      }
    } else {
      // Use memory storage as fallback
      console.log("Using memory storage for habit creation");
      newHabit = await habitDefinitionStorage.create({
        title,
        description,
        categories,
        requiredTeamSize,
        durationDays,
        dailyStartTime,
        dailyTasks,
        authorId,
        createdAt: Date.now(),
      });
    }

    // Format the response
    try {
      const formattedHabit = formatHabitResponse(newHabit);
      res.status(201).json(formattedHabit);
    } catch (formatError) {
      console.error("Error formatting habit response:", formatError);
      res.status(500).json({ message: "Server Error" });
    }
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
        include: [
          {
            model: SubTask,
            as: "daily_tasks",
          },
          {
            model: User,
            as: "author",
            attributes: ['name'], // Only get the author's name
          },
          {
            model: Category,
            as: "categories",
            attributes: ['name'], // Only get the category name
          }
        ],
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

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    let categories;

    if (isDatabaseConnected()) {
      // Use MySQL if connected
      categories = await Category.findAll({
        attributes: ['name', 'usageCount'],
        order: [['usageCount', 'DESC'], ['name', 'ASC']],
      });
    } else {
      // Use memory storage as fallback (mock categories)
      categories = [
        { name: "健康与健身", usageCount: 10 },
        { name: "学习", usageCount: 8 },
        { name: "生产力", usageCount: 7 },
        { name: "创造力", usageCount: 6 },
        { name: "阅读", usageCount: 5 },
        { name: "写作", usageCount: 4 },
        { name: "编程", usageCount: 3 },
        { name: "冥想", usageCount: 3 },
        { name: "瑜伽", usageCount: 2 },
        { name: "跑步", usageCount: 2 },
        { name: "绘画", usageCount: 1 },
        { name: "音乐", usageCount: 1 },
        { name: "摄影", usageCount: 1 },
        { name: "旅行", usageCount: 1 },
        { name: "烹饪", usageCount: 1 },
      ];
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
