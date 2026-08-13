import { Router } from 'express';
import {
  getMyRoadmaps,
  getTemplates,
  getRoadmap,
  createRoadmap,
  cloneRoadmap,
  updateRoadmap,
  reorderRoadmaps,
  deleteRoadmap,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';
import { roadmapValidation, reorderValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/templates', getTemplates);
router.route('/').get(getMyRoadmaps).post(roadmapValidation, validate, createRoadmap);
router.put('/reorder', reorderValidation, validate, reorderRoadmaps);
router.post('/:id/clone', objectIdParam, validate, cloneRoadmap);
router
  .route('/:id')
  .get(objectIdParam, validate, getRoadmap)
  .put(objectIdParam, roadmapValidation, validate, updateRoadmap)
  .delete(objectIdParam, validate, deleteRoadmap);

export default router;
