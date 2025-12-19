const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskLogSchema = new Schema({
  subTaskId: {
    type: String,
    required: true
  },
  elapsedSeconds: {
    type: Number,
    default: 0
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Number,
    default: null
  }
});

module.exports = TaskLogSchema;
