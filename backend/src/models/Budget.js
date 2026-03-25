const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true, index: true,
  },
  category: {
    type: String, required: [true, 'Category is required'], trim: true,
  },
  limitAmount: {
    type: Number, required: [true, 'Limit amount is required'], min: 1,
  },
  period: {
    type: String, default: 'monthly', enum: ['weekly', 'monthly', 'yearly'],
  },
  startDate: {
    type: Date, default: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  },
  icon: { type: String, default: '📦' },
  color: { type: String, default: '#9ca3af' },
}, { timestamps: true });

budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
