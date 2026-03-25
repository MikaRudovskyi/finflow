const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',       getAll);
router.post('/',      create);
router.put('/:id',    update);
router.delete('/:id', remove);

module.exports = router;
