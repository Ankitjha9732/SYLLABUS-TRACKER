import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import detailRoutes from './routes/detailRoutes.js';

import session from 'express-session';
import MongoStore from 'connect-mongo';

dotenv.config();

connectDB();

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// CORS - use configured origin
const envOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => String(s || '').trim().replace(/\/+$/, ''))
  .filter(Boolean);
const devOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const allowedOrigins = [...new Set([...envOrigins, ...devOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60 * 24 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  }
});

app.use(sessionMiddleware);

/*
 * OAuth Routes - added first to handle /api/auth/* routes
 */
app.use('/api/auth', authRoutes);

/*
 * Syllabus, progress, detail routes
 */
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/topics', detailRoutes);

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'API is running', time: new Date().toISOString() })
);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

function normalizeOrigin(s) { return String(s || '').trim().replace(/\/+$/, ''); }