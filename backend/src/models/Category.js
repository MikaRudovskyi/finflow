const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  icon:  { type: String, default: '📦' },
  color: { type: String, default: '#9ca3af' },
  type:  { type: String, enum: ['income', 'expense', 'both'], default: 'expense' },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
