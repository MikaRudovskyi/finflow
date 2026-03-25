const router = require('express').Router();
const { body } = require('express-validator');
const { getAll, create, update, remove, exportCSV } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',           getAll);
router.get('/export/csv', exportCSV);
router.post('/', [
  body('type').isIn(['income', 'expense']),
  body('amount').isFloat({ min: 0.01 }),
  body('category').trim().notEmpty(),
  body('date').isISO8601(),
], create);
router.put('/:id',    update);
router.delete('/:id', remove);

module.exports = router;
