// Memory storage for testing purposes when MongoDB is unavailable

// Mock data store
const mockData = {
  users: [],
  habitDefinitions: [],
  activeHabits: []
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// User operations
const userStorage = {
  findOne: async (query = {}) => {
    if (Object.keys(query).length === 0) {
      return mockData.users[0];
    }
    return mockData.users.find(user => {
      return Object.entries(query).every(([key, value]) => user[key] === value);
    });
  },
  create: async (userData) => {
    const newUser = {
      _id: generateId(),
      id: generateId(),
      ...userData,
      createdAt: Date.now()
    };
    mockData.users.push(newUser);
    return newUser;
  },
  update: async (query, updateData) => {
    const userIndex = Object.keys(query).length === 0 
      ? 0 
      : mockData.users.findIndex(user => {
          return Object.entries(query).every(([key, value]) => user[key] === value);
        });
    
    if (userIndex === -1) return null;
    
    mockData.users[userIndex] = {
      ...mockData.users[userIndex],
      ...updateData
    };
    
    return mockData.users[userIndex];
  }
};

// HabitDefinition operations
const habitDefinitionStorage = {
  find: async (query = {}) => {
    if (Object.keys(query).length === 0) {
      return mockData.habitDefinitions;
    }
    return mockData.habitDefinitions.filter(habit => {
      return Object.entries(query).every(([key, value]) => habit[key] === value);
    });
  },
  findById: async (id) => {
    return mockData.habitDefinitions.find(habit => habit._id === id || habit.id === id);
  },
  create: async (habitData) => {
    const newHabit = {
      _id: generateId(),
      id: generateId(),
      ...habitData,
      createdAt: Date.now()
    };
    mockData.habitDefinitions.push(newHabit);
    return newHabit;
  }
};

// ActiveHabit operations
const activeHabitStorage = {
  find: async (query = {}) => {
    if (Object.keys(query).length === 0) {
      return mockData.activeHabits;
    }
    return mockData.activeHabits.filter(habit => {
      return Object.entries(query).every(([key, value]) => habit[key] === value);
    });
  },
  findById: async (id) => {
    return mockData.activeHabits.find(habit => habit._id === id || habit.id === id);
  },
  create: async (activeHabitData) => {
    const newActiveHabit = {
      _id: generateId(),
      id: generateId(),
      ...activeHabitData,
      startDate: Date.now(),
      currentDay: 1,
      timeModificationRequests: [],
      hasModifiedTimeToday: false
    };
    mockData.activeHabits.push(newActiveHabit);
    return newActiveHabit;
  },
  findByIdAndUpdate: async (id, updateData) => {
    const index = mockData.activeHabits.findIndex(habit => habit._id === id || habit.id === id);
    if (index === -1) return null;
    
    mockData.activeHabits[index] = {
      ...mockData.activeHabits[index],
      ...updateData
    };
    
    return mockData.activeHabits[index];
  }
};

module.exports = {
  userStorage,
  habitDefinitionStorage,
  activeHabitStorage
};
