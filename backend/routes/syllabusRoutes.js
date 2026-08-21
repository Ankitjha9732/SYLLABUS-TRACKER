import { Router } from 'express';
import {
  getSyllabus,
  getSection,
  createSection,
  deleteSection,
  createTopic,
  updateTopic,
  deleteTopic,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
} from '../controllers/syllabusController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  topicValidation,
  topicUpdateValidation,
  subTopicCreateValidation,
  subTopicUpdateValidation,
  sectionCreateValidation,
  sectionIdParam,
  objectIdParam,
  validate,
} from '../middleware/validationMiddleware.js';

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
router.post('/subtopic', subTopicCreateValidation, validate, createSubTopic);
router
  .route('/subtopic/:id')
  .put(objectIdParam, subTopicUpdateValidation, validate, updateSubTopic)
  .delete(objectIdParam, validate, deleteSubTopic);

export default router;