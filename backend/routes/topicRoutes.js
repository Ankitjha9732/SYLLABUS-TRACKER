import { Router } from 'express';
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  reorderTopics,
  deleteTopic,
} from '../controllers/topicController.js';
import { protect } from '../middleware/authMiddleware.js';
import { topicValidation, topicUpdateValidation, reorderValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getTopics).post(topicValidation, validate, createTopic);
router.put('/reorder', reorderValidation, validate, reorderTopics);
router
  .route('/:id')
  .get(objectIdParam, validate, getTopic)
  .put(objectIdParam, topicUpdateValidation, validate, updateTopic)
  .delete(objectIdParam, validate, deleteTopic);

export default router;
