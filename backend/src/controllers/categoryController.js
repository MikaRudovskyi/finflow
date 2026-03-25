const Category = require('../models/Category');

const getAll = async (req, res) => {
  try {
    const cats = await Category.find().sort({ type: 1, name: 1 });
    res.json({ categories: cats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll };
