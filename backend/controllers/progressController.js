import Progress from '../models/Progress.js';
import SubTopic from '../models/SubTopic.js';
import Topic from '../models/Topic.js';
import Module from '../models/Module.js';
import { buildSyllabusTree } from '../utils/syllabusBuilder.js';
import { getStreak, activityHeatmap } from '../utils/progressAnalytics.js';

// @desc    Get aggregated stats for dashboard/progress pages
// @route   GET /api/progress/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const tree = await buildSyllabusTree(req.user._id);

    res.json({
      success: true,
      stats: {
        totals: tree.totals,
        moduleStats: tree.modules.map((m) => ({
          id: m._id,
          title: m.title,
          total: m.total,
          completed: m.completed,
          inProgress: m.inProgress,
          progress: m.progress,
          isCustom: m.isCustom,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user progress with subtopic/topic/module context (for Notes & Progress pages)
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean();

    const subTopicIds = progress.map((p) => p.subTopicId);
    const subtopics = await SubTopic.find({ _id: { $in: subTopicIds } }).lean();
    const stMap = new Map(subtopics.map((s) => [String(s._id), s]));
    const topicIds = subtopics.map((s) => s.topicId);
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const tMap = new Map(topics.map((t) => [String(t._id), t]));
    const moduleIds = topics.map((t) => t.moduleId);
    const modules = await Module.find({ _id: { $in: moduleIds } }).lean();
    const mMap = new Map(modules.map((m) => [String(m._id), m]));

    const items = progress.map((p) => {
      const st = stMap.get(String(p.subTopicId));
      const topic = st ? tMap.get(String(st.topicId)) : null;
      const module = topic ? mMap.get(String(topic.moduleId)) : null;
      return {
        _id: p._id,
        status: p.status,
        notes: p.notes,
        startedAt: p.startedAt,
        completedAt: p.completedAt,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
        subtopic: st ? { id: st._id, title: st.title, difficulty: st.difficulty, isCustom: st.isCustom, description: st.description } : null,
        topic: topic ? { id: topic._id, title: topic.title, isCustom: topic.isCustom } : null,
        module: module ? { id: module._id, title: module.title, isCustom: module.isCustom } : null,
      };
    });

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress status for a subtopic
// @route   PUT /api/progress/:subTopicId
// @access  Private
export const updateProgress = async (req, res, next) => {
  try {
    const { subTopicId } = req.params;
    const { status } = req.body;

    const subtopic = await SubTopic.findById(subTopicId);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });

    const isVisible =
      (!subtopic.isCustom && !subtopic.createdBy) ||
      String(subtopic.createdBy) === String(req.user.id);
    if (!isVisible) return res.status(403).json({ success: false, message: 'SubTopic not found' });

    let progress = await Progress.findOne({ userId: req.user.id, subTopicId });

    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        subTopicId,
        status,
        startedAt: status === 'in_progress' || status === 'completed' ? new Date() : null,
        completedAt: status === 'completed' ? new Date() : null,
      });
    } else {
      if (status === 'completed') {
        if (progress.status !== 'completed') progress.startedAt = progress.startedAt || new Date();
        progress.completedAt = new Date();
      } else if (status === 'in_progress') {
        progress.completedAt = null;
        progress.startedAt = progress.startedAt || new Date();
      } else {
        progress.completedAt = null;
        if (progress.status === 'completed') progress.startedAt = null;
      }
      progress.status = status;
      await progress.save();
    }

    res.json({ success: true, message: 'Progress updated', progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/update notes on a subtopic
// @route   POST /api/progress/:subTopicId/notes
// @access  Private
export const saveNotes = async (req, res, next) => {
  try {
    const { subTopicId } = req.params;
    const { notes } = req.body;

    const subtopic = await SubTopic.findById(subTopicId);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });

    let progress = await Progress.findOne({ userId: req.user.id, subTopicId });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id, subTopicId, status: 'not_started', notes });
    } else {
      progress.notes = notes;
      await progress.save();
    }
    res.json({ success: true, message: 'Notes saved', progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset all of the user's progress
// @route   DELETE /api/progress
// @access  Private
export const resetProgress = async (req, res, next) => {
  try {
    await Progress.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'All progress has been reset' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk set status for every subtopic inside a topic (direct topic check)
// @route   PUT /api/progress/topic/:topicId
// @access  Private
export const updateTopicProgress = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { status } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const subtopics = await SubTopic.find({ topicId });
    const now = new Date();

    for (const st of subtopics) {
      let progress = await Progress.findOne({ userId: req.user.id, subTopicId: st._id });
      if (!progress) {
        await Progress.create({
          userId: req.user.id,
          subTopicId: st._id,
          status,
          startedAt: status === 'in_progress' || status === 'completed' ? now : null,
          completedAt: status === 'completed' ? now : null,
        });
      } else {
        progress.status = status;
        if (status === 'completed') {
          progress.startedAt = progress.startedAt || now;
          progress.completedAt = now;
        } else if (status === 'in_progress') {
          progress.completedAt = null;
          progress.startedAt = progress.startedAt || now;
        } else {
          progress.completedAt = null;
          if (progress.status === 'completed') progress.startedAt = null;
        }
        await progress.save();
      }
    }

    res.json({ success: true, message: 'Topic progress updated', count: subtopics.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk set status for every subtopic inside a module (direct module check)
// @route   PUT /api/progress/module/:moduleId
// @access  Private
export const updateModuleProgress = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { status } = req.body;

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    const topicIds = await Topic.find({ moduleId }).distinct('_id');
    const subtopics = await SubTopic.find({ topicId: { $in: topicIds } });
    const now = new Date();

    for (const st of subtopics) {
      let progress = await Progress.findOne({ userId: req.user.id, subTopicId: st._id });
      if (!progress) {
        await Progress.create({
          userId: req.user.id,
          subTopicId: st._id,
          status,
          startedAt: status === 'in_progress' || status === 'completed' ? now : null,
          completedAt: status === 'completed' ? now : null,
        });
      } else {
        progress.status = status;
        if (status === 'completed') {
          progress.startedAt = progress.startedAt || now;
          progress.completedAt = now;
        } else if (status === 'in_progress') {
          progress.completedAt = null;
          progress.startedAt = progress.startedAt || now;
        } else {
          progress.completedAt = null;
          if (progress.status === 'completed') progress.startedAt = null;
        }
        await progress.save();
      }
    }

    res.json({ success: true, message: 'Module progress updated', count: subtopics.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get learning analytics: streaks + activity heatmap
// @route   GET /api/progress/activity
// @access  Private
export const getActivity = async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .select('createdAt updatedAt startedAt completedAt')
      .lean();

    const streak = getStreak(progress);
    const heatmap = activityHeatmap(progress, 120);

    res.json({ success: true, streak, heatmap });
  } catch (error) {
    next(error);
  }
};