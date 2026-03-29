const express = require('express');
const router = express.Router();
const { getAllTasks, getTaskById, createTask, updateTask, deleteTask } = require('../../controllers/taskController');
const { authenticate } = require('../../middleware/authMiddleware');
const { taskRules, validate } = require('../../middleware/validationMiddleware');

// All task routes are protected
router.use(authenticate);

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', taskRules, validate, createTask);
router.put('/:id', taskRules, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;