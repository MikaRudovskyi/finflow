const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget      = require('../models/Budget');

const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      totalBudgets,
      incomeAgg,
      expenseAgg,
      recentUsers,
      topSpenders,
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Budget.countDocuments(),
      Transaction.aggregate([{ $match: { type: 'income'  } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt currency'),
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: '$userId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { total: 1, count: 1, 'user.name': 1, 'user.email': 1 } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalTransactions,
      totalBudgets,
      totalIncome:  incomeAgg[0]?.total  || 0,
      totalExpense: expenseAgg[0]?.total || 0,
      recentUsers,
      topSpenders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-passwordHash');

    const userIds  = users.map(u => u._id);
    const txCounts = await Transaction.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, totalSpent: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } } } },
    ]);
    const txMap = {};
    txCounts.forEach(t => { txMap[t._id.toString()] = { count: t.count, totalSpent: t.totalSpent }; });

    const result = users.map(u => ({
      ...u.toJSON(),
      txCount:    txMap[u._id.toString()]?.count      || 0,
      totalSpent: txMap[u._id.toString()]?.totalSpent || 0,
    }));

    res.json({ users: result, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [transactions, budgets, stats] = await Promise.all([
      Transaction.find({ userId: user._id }).sort({ date: -1 }).limit(20),
      Budget.find({ userId: user._id }),
      Transaction.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const income  = stats.find(s => s._id === 'income')?.total  || 0;
    const expense = stats.find(s => s._id === 'expense')?.total || 0;

    res.json({ user, transactions, budgets, stats: { income, expense, balance: income - expense } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, currency } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, currency },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Promise.all([
      Transaction.deleteMany({ userId: req.params.id }),
      Budget.deleteMany({ userId: req.params.id }),
    ]);

    res.json({ message: 'User and all related data deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 30, userId, type, search } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (type)   filter.type   = type;
    if (search) filter.note   = { $regex: search, $options: 'i' };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(filter);
    const txns  = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email');

    res.json({ transactions: txns, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findByIdAndDelete(req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBudgets = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Budget.countDocuments();
    const budgets = await Budget.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email');

    res.json({ budgets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.passwordHash = password;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats, getUsers, getUserById, updateUser, deleteUser, changePassword, getTransactions, deleteTransaction, getBudgets };