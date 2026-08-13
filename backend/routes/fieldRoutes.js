import { Router } from 'express';
import { getFields, createField } from '../controllers/fieldController.js';
import { protect } from '../middleware/authMiddleware.js';
import { fieldValidation, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.get('/', getFields);
router.post('/', protect, fieldValidation, validate, createField);

export default router;
