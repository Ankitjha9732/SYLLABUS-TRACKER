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
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .exists()
    .withMessage('Please confirm your password')
    .custom((val, { req }) => val === req.body.password)
    .withMessage('Passwords do not match'),
  body('subject').isIn(['mern', 'dsa', 'pcm']).withMessage('Subject must be mern, dsa or pcm'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }).withMessage('Name cannot exceed 60 characters'),
];

export const roadmapValidation = [
  body('title').trim().notEmpty().withMessage('Roadmap title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('icon').optional().trim().isLength({ max: 40 }).withMessage('Icon cannot exceed 40 characters'),
  body('subject').isIn(['mern', 'dsa', 'pcm']).withMessage('Subject must be mern, dsa or pcm'),
  body('targetDate').optional().custom((val) => val === '' || !Number.isNaN(Date.parse(val))).withMessage('Target date is invalid'),
];

export const sectionValidation = [
  body('roadmapId').custom(isValidObjectId).withMessage('Please select a valid roadmap'),
  body('title').trim().notEmpty().withMessage('Section title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const sectionCreateValidation = [
  body('title').trim().notEmpty().withMessage('Section title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const topicValidation = [
  body('sectionId').custom(isValidObjectId).withMessage('Please select a valid section'),
  body('title').trim().notEmpty().withMessage('Topic title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const topicUpdateValidation = [
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

export const reorderValidation = [
  body('orderedIds').isArray({ min: 1 }).withMessage('orderedIds must be a non-empty array'),
];

export const goalValidation = [
  body('title').trim().notEmpty().withMessage('Goal title is required').isLength({ max: 160 }).withMessage('Title cannot exceed 160 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('roadmapId').optional().custom((val) => val === '' || isValidObjectId(val)).withMessage('Invalid roadmap id'),
  body('targetDate').optional().custom((val) => val === '' || !Number.isNaN(Date.parse(val))).withMessage('Target date is invalid'),
];

export const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 160 }).withMessage('Title cannot exceed 160 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('roadmapId').optional().custom((val) => val === '' || isValidObjectId(val)).withMessage('Invalid roadmap id'),
  body('date').optional().trim().isLength({ max: 20 }).withMessage('Date cannot exceed 20 characters'),
];

export const studySessionValidation = [
  body('roadmapId').optional().custom((val) => val === '' || isValidObjectId(val)).withMessage('Invalid roadmap id'),
  body('topicId').optional().custom((val) => val === '' || isValidObjectId(val)).withMessage('Invalid topic id'),
  body('subtopicId').optional().custom((val) => val === '' || isValidObjectId(val)).withMessage('Invalid subtopic id'),
];

export const moduleValidation = [
  body('title').trim().notEmpty().withMessage('Module title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
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

export const sectionBulkProgressValidation = [
  param('sectionId').custom(isValidObjectId).withMessage('Invalid section id'),
  body('status').isIn(['not_started', 'in_progress', 'completed']).withMessage('Status must be not_started, in_progress or completed'),
];

export const notesValidation = [
  param('subTopicId').custom(isValidObjectId).withMessage('Invalid subtopic id'),
  body('notes').isString().withMessage('Notes must be text').isLength({ max: 5000 }).withMessage('Notes cannot exceed 5000 characters'),
];

// ---------------------------------------------------------------------------
// V2: topic-level progress + per-topic content (notes / questions / problems)
// ---------------------------------------------------------------------------

export const topicProgressValidation = [
  param('topicId').custom(isValidObjectId).withMessage('Invalid topic id'),
  body('completed').isBoolean().withMessage('completed must be a boolean'),
];

export const topicIdParam = [param('topicId').custom(isValidObjectId).withMessage('Invalid topic id')];
export const sectionIdParam = [param('sectionId').custom(isValidObjectId).withMessage('Invalid section id')];
export const noteIdParam = [param('noteId').custom(isValidObjectId).withMessage('Invalid note id')];
export const questionIdParam = [param('questionId').custom(isValidObjectId).withMessage('Invalid question id')];
export const problemIdParam = [param('problemId').custom(isValidObjectId).withMessage('Invalid problem id')];

export const noteValidation = [
  body('content').isString().withMessage('Note content must be text').notEmpty().withMessage('Note content is required').isLength({ max: 20000 }).withMessage('Note cannot exceed 20000 characters'),
];

export const noteUpdateValidation = [
  body('content').isString().withMessage('Note content must be text').notEmpty().withMessage('Note content is required').isLength({ max: 20000 }).withMessage('Note cannot exceed 20000 characters'),
];

export const questionValidation = [
  body('question').isString().withMessage('Question must be text').notEmpty().withMessage('Question is required').isLength({ max: 500 }).withMessage('Question cannot exceed 500 characters'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean'),
];

export const questionUpdateValidation = [
  body('question').optional().isString().trim().notEmpty().withMessage('Question cannot be empty').isLength({ max: 500 }).withMessage('Question cannot exceed 500 characters'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean'),
];

export const problemValidation = [
  body('title').isString().trim().notEmpty().withMessage('Problem title is required').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('link').optional().isString().isLength({ max: 500 }).withMessage('Link cannot exceed 500 characters'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium or hard'),
  body('note').optional().isString().isLength({ max: 2000 }).withMessage('Note cannot exceed 2000 characters'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean'),
];

export const problemUpdateValidation = [
  body('title').optional().isString().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('link').optional().isString().isLength({ max: 500 }).withMessage('Link cannot exceed 500 characters'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium or hard'),
  body('note').optional().isString().isLength({ max: 2000 }).withMessage('Note cannot exceed 2000 characters'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean'),
];