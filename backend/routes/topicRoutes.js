import { Router } from 'express';
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController.js';
import { protect } from '../middleware/authMiddleware.js';
import { topicValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getTopics);
router.post('/', topicValidation, validate, createTopic);
router.get('/:id', objectIdParam, validate, getTopic);
router.put('/:id', objectIdParam, validate, updateTopic);
router.delete('/:id', objectIdParam, validate, deleteTopic);

export default router;