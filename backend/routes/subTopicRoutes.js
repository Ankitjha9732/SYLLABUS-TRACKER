import { Router } from 'express';
import {
  getSubTopics,
  getSubTopic,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
} from '../controllers/subTopicController.js';
import { protect } from '../middleware/authMiddleware.js';
import { objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getSubTopics);
router.post('/', createSubTopic);
router.get('/:id', objectIdParam, validate, getSubTopic);
router.put('/:id', objectIdParam, validate, updateSubTopic);
router.delete('/:id', objectIdParam, validate, deleteSubTopic);

export default router;