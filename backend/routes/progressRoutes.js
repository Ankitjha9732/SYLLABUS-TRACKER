import { Router } from 'express';
import {
  getStats,
  getProgress,
  updateProgress,
  saveNotes,
  resetProgress,
  getActivity,
  updateTopicProgress,
  updateModuleProgress,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  progressUpdateValidation,
  topicBulkProgressValidation,
  moduleBulkProgressValidation,
  notesValidation,
  validate,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/activity', getActivity);
router.get('/', getProgress);
router.delete('/', resetProgress);
router.put('/topic/:topicId', topicBulkProgressValidation, validate, updateTopicProgress);
router.put('/module/:moduleId', moduleBulkProgressValidation, validate, updateModuleProgress);
router.put('/:subTopicId', progressUpdateValidation, validate, updateProgress);
router.post('/:subTopicId/notes', notesValidation, validate, saveNotes);

export default router;