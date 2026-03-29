const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

// Validate results helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }
  next();
};

// Auth validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Task validation rules
const taskRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim()
];

module.exports = { validate, registerRules, loginRules, taskRules };