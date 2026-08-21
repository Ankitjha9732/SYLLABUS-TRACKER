import { Router } from 'express';
import {
  getStats,
  getProgress,
  updateTopicProgress,
  updateSubTopicProgress,
  resetProgress,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { topicProgressValidation, subTopicProgressValidation, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/', getProgress);
router.delete('/', resetProgress);
router.put('/topic/:topicId', topicProgressValidation, validate, updateTopicProgress);
router.put('/subtopic/:subTopicId', subTopicProgressValidation, validate, updateSubTopicProgress);

export default router;