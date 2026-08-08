import { Router } from 'express';
import {
  getSyllabusTree,
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} from '../controllers/moduleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { moduleValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/tree', getSyllabusTree);
router.route('/').get(getModules).post(moduleValidation, validate, createModule);
router
  .route('/:id')
  .get(objectIdParam, validate, getModule)
  .put(objectIdParam, moduleValidation, validate, updateModule)
  .delete(objectIdParam, validate, deleteModule);

export default router;