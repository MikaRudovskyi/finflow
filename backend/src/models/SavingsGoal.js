const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true, index: true,
  },
  name:         { type: String, required: true, trim: true, maxlength: 80 },
  icon:         { type: String, default: '🏦' },
  targetAmount: { type: Number, required: true, min: 1 },
  currentAmount:{ type: Number, default: 0, min: 0 },
  color:        { type: String, default: '#5b9cf6' },
  deadline:     { type: Date },
  completed:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
