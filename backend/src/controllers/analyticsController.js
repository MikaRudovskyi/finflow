const Transaction = require('../models/Transaction');

const getSummary = async (req, res) => {
  try {
    const now   = new Date();
    const year  = Number(req.query.year  || now.getFullYear());
    const month = Number(req.query.month || now.getMonth() + 1);

    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);

    const agg = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const income  = agg.find(a => a._id === 'income')?.total  || 0;
    const expense = agg.find(a => a._id === 'expense')?.total || 0;

    // Get balance = all-time income - all-time expense
    const allTime = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const totalIncome  = allTime.find(a => a._id === 'income')?.total  || 0;
    const totalExpense = allTime.find(a => a._id === 'expense')?.total || 0;

    res.json({
      income,
      expense,
      saved:   income - expense,
      balance: totalIncome - totalExpense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getByCategory = async (req, res) => {
  try {
    const now   = new Date();
    const year  = Number(req.query.year  || now.getFullYear());
    const month = Number(req.query.month || now.getMonth() + 1);
    const type  = req.query.type || 'expense';

    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);

    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id, type, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ categories: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMonthly = async (req, res) => {
  try {
    const year   = Number(req.query.year   || new Date().getFullYear());
    const months = Number(req.query.months || 6);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: new Date(year, new Date().getMonth() - months + 1, 1) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ monthly: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSummary, getByCategory, getMonthly };