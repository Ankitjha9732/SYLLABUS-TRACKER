import Progress from '../models/Progress.js';
import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Note from '../models/Note.js';
import Question from '../models/Question.js';
import Problem from '../models/Problem.js';
import { buildRoadmapTree } from '../utils/roadmapBuilder.js';

const isVisibleContent = (doc, userId) => !doc.createdBy || String(doc.createdBy) === String(userId);

// @desc    Get aggregated stats for the user's subject syllabus
// @route   GET /api/progress/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user.id, isTemplate: false, linked: true });
    if (!roadmap) {
      return res.json({
        success: true,
        stats: {
          totals: {
            topicsTotal: 0,
            topicsCompleted: 0,
            notStarted: 0,
            overallProgress: 0,
            questionsTotal: 0,
            questionsCompleted: 0,
            problemsTotal: 0,
            problemsSolved: 0,
            notesTotal: 0,
          },
          sectionStats: [],
        },
      });
    }

    const [tree, notesCount, questionsTotal, questionsCompleted, problemsTotal, problemsSolved] = await Promise.all([
      buildRoadmapTree(req.user._id, roadmap),
      Note.countDocuments({ userId: req.user.id }),
      Question.countDocuments({ userId: req.user.id }),
      Question.countDocuments({ userId: req.user.id, completed: true }),
      Problem.countDocuments({ userId: req.user.id }),
      Problem.countDocuments({ userId: req.user.id, completed: true }),
    ]);

    const totals = {
      ...tree.totals,
      questionsTotal,
      questionsCompleted,
      problemsTotal,
      problemsSolved,
      notesTotal: notesCount,
    };

    const sectionStats = tree.sections
      .filter((s) => !s.optional)
      .map((s) => ({
        id: s._id,
        title: s.title,
        total: s.total,
        completed: s.completed,
        progress: s.progress,
      }));

    res.json({ success: true, stats: { totals, sectionStats } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user progress records with topic context
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean();

    const topicIds = progress.map((p) => p.topicId);
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const tMap = new Map(topics.map((t) => [String(t._id), t]));
    const sectionIds = topics.map((t) => t.sectionId);
    const sections = await Section.find({ _id: { $in: sectionIds } }).lean();
    const sMap = new Map(sections.map((s) => [String(s._id), s]));

    const items = progress.map((p) => {
      const topic = tMap.get(String(p.topicId));
      const section = topic ? sMap.get(String(topic.sectionId)) : null;
      return {
        _id: p._id,
        completed: p.completed,
        completedAt: p.completedAt,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
        topic: topic ? { id: topic._id, title: topic.title, isCustom: topic.isCustom } : null,
        section: section ? { id: section._id, title: section.title } : null,
      };
    });

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

// @desc    Set a topic's completion
// @route   PUT /api/progress/topic/:topicId
// @access  Private
export const updateTopicProgress = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { completed } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    if (!isVisibleContent(topic, req.user.id)) {
      return res.status(403).json({ success: false, message: 'Topic not found' });
    }

    const complete = completed === true;
    const now = new Date();
    const roadmapId = topic.roadmapId || null;

    await Progress.findOneAndUpdate(
      { userId: req.user.id, topicId, subTopicId: null },
      {
        $set: { completed: complete, completedAt: complete ? now : null },
        $setOnInsert: { roadmapId },
      },
      { upsert: true, new: true }
    );

    // Keep subtopic-level records in sync so a single topic toggle stays
    // consistent with the derived subtopic-driven progress.
    const subtopics = await SubTopic.find({ topicId }).select('_id').lean();
    if (subtopics.length) {
      await Promise.all(
        subtopics.map((sub) =>
          Progress.findOneAndUpdate(
            { userId: req.user.id, topicId, subTopicId: sub._id },
            { $set: { completed: complete, completedAt: complete ? now : null }, $setOnInsert: { roadmapId } },
            { upsert: true, new: true }
          )
        )
      );
    }

    res.json({ success: true, message: 'Progress updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Set a subtopic's completion (feeds topic/section/subject progress)
// @route   PUT /api/progress/subtopic/:subTopicId
// @access  Private
export const updateSubTopicProgress = async (req, res, next) => {
  try {
    const { subTopicId } = req.params;
    const { completed } = req.body;

    const subtopic = await SubTopic.findById(subTopicId);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });

    const topic = await Topic.findById(subtopic.topicId);
    if (!topic || !isVisibleContent(topic, req.user.id)) {
      return res.status(403).json({ success: false, message: 'SubTopic not found' });
    }

    const complete = completed === true;
    const updated = await Progress.findOneAndUpdate(
      { userId: req.user.id, topicId: topic._id, subTopicId },
      {
        $set: { completed: complete, completedAt: complete ? new Date() : null },
        $setOnInsert: { roadmapId: topic.roadmapId || null },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Progress updated', progress: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset all of the user's progress
// @route   DELETE /api/progress
// @access  Private
export const resetProgress = async (req, res, next) => {
  try {
    await Promise.all([
      Progress.deleteMany({ userId: req.user.id }),
      Note.deleteMany({ userId: req.user.id }),
      Question.deleteMany({ userId: req.user.id }),
      Problem.deleteMany({ userId: req.user.id }),
    ]);
    res.json({ success: true, message: 'All your progress and notes have been reset' });
  } catch (error) {
    next(error);
  }
};