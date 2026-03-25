const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true, index: true,
  },
  type: {
    type: String, required: true, enum: ['income', 'expense'],
  },
  amount: {
    type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be positive'],
  },
  category: {
    type: String, required: [true, 'Category is required'], trim: true,
  },
  note: {
    type: String, trim: true, maxlength: 200, default: '',
  },
  date: {
    type: Date, required: true, default: Date.now,
  },
}, { timestamps: true });

// Compound indexes for common queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
