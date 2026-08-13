import StudySession from '../models/StudySession.js';

// @desc    Get study sessions (optionally scoped to a range)
// @route   GET /api/study-sessions
// @access  Private
export const getStudySessions = async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.from && req.query.to) {
      query.startedAt = { $gte: new Date(req.query.from), $lte: new Date(req.query.to) };
    }

    const sessions = await StudySession.find(query).sort({ startedAt: -1 }).limit(500);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a study session
// @route   POST /api/study-sessions/start
// @access  Private
export const startSession = async (req, res, next) => {
  try {
    const { roadmapId, topicId, subtopicId } = req.body;
    const session = await StudySession.create({
      userId: req.user.id,
      roadmapId: roadmapId || null,
      topicId: topicId || null,
      subtopicId: subtopicId || null,
      startedAt: new Date(),
    });
    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    End a study session and compute duration
// @route   PUT /api/study-sessions/:id/end
// @access  Private
export const endSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Study session not found' });
    if (session.endedAt) {
      return res.json({ success: true, message: 'Session already ended', session });
    }

    session.endedAt = new Date();
    session.durationMinutes = Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000));
    await session.save();

    res.json({ success: true, message: 'Session ended', session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated study time for a period (for analytics)
// @route   GET /api/study-sessions/summary
// @access  Private
export const getStudySummary = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const from = new Date(Date.now() - days * 86400000);
    const sessions = await StudySession.find({ userId: req.user.id, startedAt: { $gte: from } });

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const sessionsToday = sessions.filter((s) => {
      const today = new Date();
      return s.startedAt.toDateString() === today.toDateString();
    }).length;

    res.json({
      success: true,
      summary: {
        totalMinutes,
        totalSessions: sessions.length,
        sessionsToday,
      },
    });
  } catch (error) {
    next(error);
  }
};
