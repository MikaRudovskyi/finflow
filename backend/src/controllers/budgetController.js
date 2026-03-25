const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');

// GET /api/budgets — with current spending
const getAll = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });

    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Aggregate spending per category this month
    const spending = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);
    const spendMap = {};
    spending.forEach(s => { spendMap[s._id] = s.total; });

    const result = budgets.map(b => ({
      ...b.toObject(),
      spent: spendMap[b.category] || 0,
      percentage: Math.round(((spendMap[b.category] || 0) / b.limitAmount) * 100),
    }));

    res.json({ budgets: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/budgets
const create = async (req, res) => {
  try {
    const { category, limitAmount, period, icon, color } = req.body;
    const budget = await Budget.create({ userId: req.user._id, category, limitAmount, period, icon, color });
    res.status(201).json({ budget });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Budget for this category already exists.' });
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/budgets/:id
const update = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ error: 'Budget not found.' });
    res.json({ budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/budgets/:id
const remove = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ error: 'Budget not found.' });
    res.json({ message: 'Budget deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
