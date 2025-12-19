const { sequelize } = require('./config/sequelize');
const User = require('./models/User');
const HabitDefinition = require('./models/HabitDefinition');
const ActiveHabit = require('./models/ActiveHabit');
const SubTask = require('./models/SubTask');

async function seedDatabase() {
  try {
    // Check if database is connected
    await sequelize.authenticate();
    console.log('MySQL is connected. Seeding database...');

    // Create or get user
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: '测试用户',
        avatar: 'https://thirdqq.qlogo.cn/ek_qqapp/AQVJKMtqeFCGNEZqicOj7qb7mnpcJiaZNlEOf0iasx2DicuEycbIG9cQktWUBxWR1dFWfLMI2Ilt/100'
      });
      console.log('Created test user:', user.name);
    } else {
      console.log('Using existing user:', user.name);
    }

    // Create habit definitions with subtasks
    const habitDefinitions = [
      {
        title: '晨跑30分钟',
        description: '每天早上坚持跑步30分钟，提升身体素质',
        category: 'health',
        requiredTeamSize: 2,
        durationDays: 21,
        dailyStartTime: '06:00',
        authorId: user.id,
        subtasks: [
          { name: '热身运动', minDurationMinutes: 5 },
          { name: '跑步', minDurationMinutes: 30 },
          { name: '拉伸放松', minDurationMinutes: 5 }
        ]
      },
      {
        title: '阅读学习',
        description: '每天阅读至少30分钟，提升知识储备',
        category: 'learning',
        requiredTeamSize: 2,
        durationDays: 30,
        dailyStartTime: '20:00',
        authorId: user.id,
        subtasks: [
          { name: '阅读书籍', minDurationMinutes: 30 },
          { name: '做笔记', minDurationMinutes: 10 }
        ]
      },
      {
        title: '团队项目开发',
        description: '团队协作开发一个项目，提升编程技能',
        category: 'productivity',
        requiredTeamSize: 3,
        durationDays: 14,
        dailyStartTime: '19:00',
        authorId: user.id,
        subtasks: [
          { name: '项目讨论', minDurationMinutes: 30 },
          { name: '编码实现', minDurationMinutes: 90 },
          { name: '代码审查', minDurationMinutes: 30 }
        ]
      }
    ];

    for (const habitData of habitDefinitions) {
      const existingHabit = await HabitDefinition.findOne({ where: { title: habitData.title } });
      if (!existingHabit) {
        // Create habit definition
        const habit = await HabitDefinition.create({
          title: habitData.title,
          description: habitData.description,
          category: habitData.category,
          required_team_size: habitData.requiredTeamSize,
          duration_days: habitData.durationDays,
          daily_start_time: habitData.dailyStartTime,
          author_id: habitData.authorId
        });
        
        console.log('Created habit definition:', habit.title);
        
        // Create subtasks for this habit
        for (const subtaskData of habitData.subtasks) {
          await SubTask.create({
            name: subtaskData.name,
            min_duration_minutes: subtaskData.minDurationMinutes,
            habit_definition_id: habit.id
          });
        }
        
        console.log('Created', habitData.subtasks.length, 'subtasks for', habit.title);
        
        // Get habit definition with subtasks
        const habitWithSubtasks = await HabitDefinition.findByPk(habit.id, {
          include: [{ model: SubTask, as: 'daily_tasks' }]
        });
        
        // Create active habit for this user
        await ActiveHabit.create({
          user_id: user.id,
          habit_definition_id: habit.id,
          habit_snapshot: habitWithSubtasks.toJSON(),
          start_date: new Date(),
          my_logs: {},
          current_day: 1,
          has_modified_time_today: false
        });
        
        console.log('Created active habit for', user.name, 'to', habit.title);
      } else {
        console.log('Habit definition already exists:', habitData.title);
      }
    }

    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

seedDatabase();
