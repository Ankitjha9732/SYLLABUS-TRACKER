import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateMe,
  changePassword,
  googleLoginStart,
  googleLoginCallback,
  githubLoginStart,
  githubLoginCallback,
  appleLoginStart,
  appleLoginCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimit } from '../config/rateLimits.js';

const router = express.Router();

/*
 * Rate-limit all auth endpoints to mitigate brute force / credential stuffing
 */
router.use(authRateLimit);

/*
 * Email / Password Auth (existing behaviour preserved)
 */
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/password', protect, changePassword);

/*
 * Google OAuth
 */
router.get('/auth/google', googleLoginStart);
router.get('/auth/google/callback', googleLoginCallback);

/*
 * GitHub OAuth
 */
router.get('/auth/github', githubLoginStart);
router.get('/auth/github/callback', githubLoginCallback);

/*
 * Apple OAuth
 */
router.get('/auth/apple', appleLoginStart);
router.get('/auth/apple/callback', appleLoginCallback);

export default router;