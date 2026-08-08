import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateMe,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  validate,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidation, validate, updateMe);
router.put('/password', protect, changePassword);

export default router;