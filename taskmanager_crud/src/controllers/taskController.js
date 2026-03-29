const taskService = require('../services/taskService');
const { sendSuccess, sendError } = require('../utils/response');

// GET /tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getUserTasks(req.user.id);
    return sendSuccess(res, 200, 'Tasks fetched successfully', tasks);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    if (!task) return sendError(res, 404, 'Task not found');
    return sendSuccess(res, 200, 'Task fetched successfully', task);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /tasks
const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    return sendSuccess(res, 201, 'Task created successfully', task);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.user.id, req.body);
    if (!task) return sendError(res, 404, 'Task not found');
    return sendSuccess(res, 200, 'Task updated successfully', task);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// DELETE /tasks/:id
const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };