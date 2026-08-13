import { Router } from 'express';
import {
  getTopicDetail,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../controllers/detailController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  topicIdParam,
  noteIdParam,
  questionIdParam,
  problemIdParam,
  noteValidation,
  noteUpdateValidation,
  questionValidation,
  questionUpdateValidation,
  problemValidation,
  problemUpdateValidation,
  validate,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

// Detail bundle
router.get('/:topicId/detail', topicIdParam, validate, getTopicDetail);

// Notes
router.get('/:topicId/notes', topicIdParam, validate, getNotes);
router.post('/:topicId/notes', topicIdParam, noteValidation, validate, createNote);
router
  .route('/notes/:noteId')
  .put(noteIdParam, noteUpdateValidation, validate, updateNote)
  .delete(noteIdParam, validate, deleteNote);

// Questions
router.get('/:topicId/questions', topicIdParam, validate, getQuestions);
router.post('/:topicId/questions', topicIdParam, questionValidation, validate, createQuestion);
router
  .route('/questions/:questionId')
  .put(questionIdParam, questionUpdateValidation, validate, updateQuestion)
  .delete(questionIdParam, validate, deleteQuestion);

// Problems
router.get('/:topicId/problems', topicIdParam, validate, getProblems);
router.post('/:topicId/problems', topicIdParam, problemValidation, validate, createProblem);
router
  .route('/problems/:problemId')
  .put(problemIdParam, problemUpdateValidation, validate, updateProblem)
  .delete(problemIdParam, validate, deleteProblem);

export default router;