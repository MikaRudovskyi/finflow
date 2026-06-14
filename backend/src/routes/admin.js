const router    = require('express').Router();
const { adminAuth } = require('../middleware/adminAuth');
const {
  getStats, getUsers, getUserById, updateUser, deleteUser,
  getTransactions, deleteTransaction, getBudgets,
} = require('../controllers/adminController');

router.use(adminAuth);

router.get('/stats',               getStats);
router.get('/users',               getUsers);
router.get('/users/:id',           getUserById);
router.put('/users/:id',           updateUser);
router.delete('/users/:id',        deleteUser);
router.get('/transactions',        getTransactions);
router.delete('/transactions/:id', deleteTransaction);
router.get('/budgets',             getBudgets);

module.exports = router;
