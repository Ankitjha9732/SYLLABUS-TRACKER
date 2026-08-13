import { Router } from 'express';
import {
  getSyllabus,
  getSection,
  createSection,
  deleteSection,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/syllabusController.js';
import { protect } from '../middleware/authMiddleware.js';
import { topicValidation, topicUpdateValidation, sectionCreateValidation, sectionIdParam, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getSyllabus);
router.get('/:sectionId', sectionIdParam, validate, getSection);

router.post('/section', sectionCreateValidation, validate, createSection);
router.delete('/section/:id', objectIdParam, validate, deleteSection);
router.post('/topic', topicValidation, validate, createTopic);
router
  .route('/topic/:id')
  .put(objectIdParam, topicUpdateValidation, validate, updateTopic)
  .delete(objectIdParam, validate, deleteTopic);

export default router;