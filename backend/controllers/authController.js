import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import { generateToken, attachTokenCookie, clearTokenCookie } from '../utils/generateToken.js';

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  subject: user.subject,
  createdAt: user.createdAt,
});

const createUserSyllabus = async (userId, subject) => {
  const template = await Roadmap.findOne({ subject, isTemplate: true });
  if (!template) return null;

  const existing = await Roadmap.findOne({ userId, linked: true, sourceRoadmapId: template._id });
  if (existing) return existing;

  return Roadmap.create({
    title: template.title,
    icon: template.icon,
    subject: template.subject,
    description: template.description,
    userId,
    isTemplate: false,
    sourceRoadmapId: template._id,
    linked: true,
    order: 0,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, subject } = req.body;

    if (!subject || !['mern', 'dsa', 'pcm', 'pcb'].includes(subject)) {
      return res.status(400).json({ success: false, message: 'Subject must be mern, dsa, pcm or pcb' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, subject });

    // Create linked syllabus for the user
    await createUserSyllabus(user._id, subject);

    const token = generateToken(user._id);
    attachTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    attachTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout the user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get the authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: serializeUser(req.user),
  });
};

// @desc    Update the authenticated user's profile
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (name) req.user.name = name;
    await req.user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: serializeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change the authenticated user's password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};