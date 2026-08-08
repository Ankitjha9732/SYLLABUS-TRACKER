import { body, param, validationResult } from 'express-validator';
import { isValidObjectId } from './errorMiddleware.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }).withMessage('Name cannot exceed 60 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .exists()
    .withMessage('Please confirm your password')
    .custom((val, { req }) => val === req.body.password)
    .withMessage('Passwords do not match'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }).withMessage('Name cannot exceed 60 characters'),
];

export const moduleValidation = [
  body('title').trim().notEmpty().withMessage('Module title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const topicValidation = [
  body('moduleId').custom(isValidObjectId).withMessage('Please select a valid module'),
  body('title').trim().notEmpty().withMessage('Topic title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const subTopicValidation = [
  body('topicId').custom(isValidObjectId).withMessage('Please select a valid topic'),
  body('title').trim().notEmpty().withMessage('SubTopic title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium or hard'),
  body('estimatedTime').optional().trim().isLength({ max: 30 }).withMessage('Estimated time cannot exceed 30 characters'),
];

export const objectIdParam = [
  param('id').custom(isValidObjectId).withMessage('Invalid id'),
];

export const progressUpdateValidation = [
  param('subTopicId').custom(isValidObjectId).withMessage('Invalid subtopic id'),
  body('status').isIn(['not_started', 'in_progress', 'completed']).withMessage('Status must be not_started, in_progress or completed'),
];

export const topicBulkProgressValidation = [
  param('topicId').custom(isValidObjectId).withMessage('Invalid topic id'),
  body('status').isIn(['not_started', 'in_progress', 'completed']).withMessage('Status must be not_started, in_progress or completed'),
];

export const moduleBulkProgressValidation = [
  param('moduleId').custom(isValidObjectId).withMessage('Invalid module id'),
  body('status').isIn(['not_started', 'in_progress', 'completed']).withMessage('Status must be not_started, in_progress or completed'),
];

export const notesValidation = [
  param('subTopicId').custom(isValidObjectId).withMessage('Invalid subtopic id'),
  body('notes').isString().withMessage('Notes must be text').isLength({ max: 5000 }).withMessage('Notes cannot exceed 5000 characters'),
];