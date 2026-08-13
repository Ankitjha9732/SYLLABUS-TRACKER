import { Router } from 'express';
import {
  getSubTopics,
  getSubTopic,
  createSubTopic,
  updateSubTopic,
  reorderSubTopics,
  deleteSubTopic,
} from '../controllers/subTopicController.js';
import { protect } from '../middleware/authMiddleware.js';
import { subTopicValidation, reorderValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getSubTopics).post(subTopicValidation, validate, createSubTopic);
router.put('/reorder', reorderValidation, validate, reorderSubTopics);
router
  .route('/:id')
  .get(objectIdParam, validate, getSubTopic)
  .put(objectIdParam, subTopicValidation, validate, updateSubTopic)
  .delete(objectIdParam, validate, deleteSubTopic);

export default router;
