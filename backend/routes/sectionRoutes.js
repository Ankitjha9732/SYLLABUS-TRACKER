import { Router } from 'express';
import {
  getSections,
  getSection,
  createSection,
  updateSection,
  reorderSections,
  deleteSection,
} from '../controllers/sectionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sectionValidation, reorderValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getSections).post(sectionValidation, validate, createSection);
router.put('/reorder', reorderValidation, validate, reorderSections);
router
  .route('/:id')
  .get(objectIdParam, validate, getSection)
  .put(objectIdParam, sectionValidation, validate, updateSection)
  .delete(objectIdParam, validate, deleteSection);

export default router;
