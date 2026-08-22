import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import { generateToken, attachTokenCookie, clearTokenCookie } from '../utils/generateToken.js';
import crypto from 'crypto';

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  subject: user.subject,
});

const createUserSyllabus = async (userId, subject) => {
  const template = await Roadmap.findOne({ subject, isTemplate: true, linked: { $ne: true } });
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

// -------------------
// Email/Password Auth
// -------------------

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, subject } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, subject });

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

export const logoutUser = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: serializeUser(req.user),
  });
};

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

// -------------------
// OAuth Providers
// -------------------

const findOrCreateOAuthUser = async (provider, providerId, userInfo, defaultSubject) => {
  let user = await User.findOne({ email: userInfo.email });

  if (!user) {
    user = await User.create({
      name: userInfo.name || userInfo.login || 'User',
      email: userInfo.email,
      subject: defaultSubject,
      authProviders: [{ provider, providerId }],
    });
    await createUserSyllabus(user._id, defaultSubject);
  } else {
    const alreadyLinked = user.authProviders.some(
      (p) => p.provider === provider && String(p.providerId) === String(providerId)
    );
    if (!alreadyLinked) {
      user.authProviders.push({ provider, providerId });
      await user.save();
    }
  }

  return user;
};

const oauthNotConfigured = (res, provider) => {
  res.status(501).json({
    success: false,
    message: `Sign in with ${provider} is not configured. Please use email/password login.`,
  });
};

// Google OAuth
export const googleLoginStart = async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) return oauthNotConfigured(res, 'Google');

  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    }).toString();

  return res.redirect(authUrl);
};

export const googleLoginCallback = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) return oauthNotConfigured(res, 'Google');

    const { code, state } = req.query;
    if (state !== req.session.oauthState) {
      return res.status(400).json({ success: false, message: 'Invalid OAuth state' });
    }
    delete req.session.oauthState;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userRes.json();

    const user = await findOrCreateOAuthUser('google', userInfo.sub, userInfo, 'mern');

    const token = generateToken(user._id);
    attachTokenCookie(res, token);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    next(error);
  }
};

// GitHub OAuth
export const githubLoginStart = async (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID) return oauthNotConfigured(res, 'GitHub');

  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const authUrl = `https://github.com/login/oauth/authorize?` +
    new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      scope: 'read:user user:email',
      state,
    }).toString();

  return res.redirect(authUrl);
};

export const githubLoginCallback = async (req, res, next) => {
  try {
    if (!process.env.GITHUB_CLIENT_ID) return oauthNotConfigured(res, 'GitHub');

    const { code, state } = req.query;
    if (state !== req.session.oauthState) {
      return res.status(400).json({ success: false, message: 'Invalid OAuth state' });
    }
    delete req.session.oauthState;

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userData = await userRes.json();

    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const emails = await emailRes.json();
    const primaryEmail = (emails.find((e) => e.primary && e.verified) || emails[0])?.email;

    const user = await findOrCreateOAuthUser('github', userData.id, {
      name: userData.name || userData.login,
      email: primaryEmail,
    }, 'mern');

    const token = generateToken(user._id);
    attachTokenCookie(res, token);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    next(error);
  }
};

// Apple OAuth
export const appleLoginStart = async (req, res) => {
  if (!process.env.APPLE_CLIENT_ID) return oauthNotConfigured(res, 'Apple');

  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  const authUrl = `https://appleid.apple.com/auth/authorize?` +
    new URLSearchParams({
      client_id: process.env.APPLE_CLIENT_ID,
      redirect_uri: process.env.APPLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'name email',
      state,
      response_mode: 'query',
    }).toString();

  return res.redirect(authUrl);
};

export const appleLoginCallback = async (req, res, next) => {
  try {
    if (!process.env.APPLE_CLIENT_ID) return oauthNotConfigured(res, 'Apple');

    const { code, state } = req.query;
    if (state !== req.session.oauthState) {
      return res.status(400).json({ success: false, message: 'Invalid OAuth state' });
    }
    delete req.session.oauthState;

    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.APPLE_CLIENT_ID,
        client_secret: process.env.APPLE_CLIENT_SECRET,
        redirect_uri: process.env.APPLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    const idPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString()
    );

    const user = await findOrCreateOAuthUser('apple', idPayload.sub, {
      name: idPayload.name
        ? `${idPayload.name.firstName || ''} ${idPayload.name.lastName || ''}`.trim()
        : undefined,
      email: idPayload.email,
    }, 'mern');

    const token = generateToken(user._id);
    attachTokenCookie(res, token);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    next(error);
  }
};
