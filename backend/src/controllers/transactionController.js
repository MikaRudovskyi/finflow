const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// GET /api/transactions
const getAll = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = { userId: req.user._id };

    if (type)     filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(filter);
    const txns  = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ transactions: txns, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/transactions
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { type, amount, category, note, date } = req.body;
    const txn = await Transaction.create({ userId: req.user._id, type, amount, category, note, date });
    res.status(201).json({ transaction: txn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/transactions/:id
const update = async (req, res) => {
  try {
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!txn) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ transaction: txn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/transactions/:id
const remove = async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!txn) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/transactions/export/csv
const exportCSV = async (req, res) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

    const header = 'Дата,Опис,Категорія,Тип,Сума\n';
    const rows = txns.map(t => {
      const date     = new Date(t.date).toISOString().split('T')[0];
      const note     = `"${(t.note || '').replace(/"/g, '""')}"`;
      const category = `"${t.category}"`;
      const type     = t.type === 'income' ? 'Дохід' : 'Витрата';
      const amount   = t.amount;
      return `${date},${note},${category},${type},${amount}`;
    }).join('\n');

    const BOM     = '\uFEFF';
    const content = BOM + header + rows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=finflow-transactions.csv');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, create, update, remove, exportCSV };