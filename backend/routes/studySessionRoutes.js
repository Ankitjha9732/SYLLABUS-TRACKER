import { Router } from 'express';
import {
  getStudySessions,
  startSession,
  endSession,
  getStudySummary,
} from '../controllers/studySessionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { studySessionValidation, objectIdParam, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.get('/summary', getStudySummary);
router.get('/', getStudySessions);
router.post('/start', studySessionValidation, validate, startSession);
router.put('/:id/end', objectIdParam, validate, endSession);

export default router;
