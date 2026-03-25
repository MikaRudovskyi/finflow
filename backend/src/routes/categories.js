const router = require('express').Router();
const { getAll } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', getAll);
module.exports = router;
