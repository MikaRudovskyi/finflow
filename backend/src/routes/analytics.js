const router = require('express').Router();
const { getSummary, getByCategory, getMonthly } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary',     getSummary);
router.get('/by-category', getByCategory);
router.get('/monthly',     getMonthly);

module.exports = router;
