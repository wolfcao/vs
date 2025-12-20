// Category.js - 分类模型
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['name'] }
  ]
});

module.exports = Category;