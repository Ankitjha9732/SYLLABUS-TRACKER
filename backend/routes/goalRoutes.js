import { Router } from 'express';
import { getGoals, createGoal, updateGoal, toggleGoal, reorderGoals, deleteGoal } from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { goalValidation, reorderValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getGoals).post(goalValidation, validate, createGoal);
router.put('/reorder', reorderValidation, validate, reorderGoals);
router.put('/:id/toggle', objectIdParam, validate, toggleGoal);
router
  .route('/:id')
  .put(objectIdParam, goalValidation, validate, updateGoal)
  .delete(objectIdParam, validate, deleteGoal);

export default router;
