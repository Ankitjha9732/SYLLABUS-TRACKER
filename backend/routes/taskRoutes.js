import { Router } from 'express';
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { taskValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getTasks).post(taskValidation, validate, createTask);
router.put('/:id/toggle', objectIdParam, validate, toggleTask);
router
  .route('/:id')
  .put(objectIdParam, taskValidation, validate, updateTask)
  .delete(objectIdParam, validate, deleteTask);

export default router;
