import { Router } from 'express';
import {
  getStats,
  getProgress,
  updateTopicProgress,
  resetProgress,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { topicProgressValidation, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/', getProgress);
router.delete('/', resetProgress);
router.put('/topic/:topicId', topicProgressValidation, validate, updateTopicProgress);

export default router;