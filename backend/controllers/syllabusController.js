import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Progress from '../models/Progress.js';
import Note from '../models/Note.js';
import Question from '../models/Question.js';
import Problem from '../models/Problem.js';
import { buildRoadmapTree, getContentRoadmapId } from '../utils/roadmapBuilder.js';

const getUserSyllabusRoadmap = async (userId, subject) => {
  const template = await Roadmap.findOne({ subject, isTemplate: true, linked: { $ne: true } }).sort({ order: 1 });
  if (!template) return null;

  const linked = await Roadmap.findOne({ userId, linked: true, sourceRoadmapId: template._id });
  if (!linked) return null;

  return linked;
};

const getSyllabusContentId = (linkedRoadmap) => getContentRoadmapId(linkedRoadmap);

// @desc    Create a custom section inside the user's subject syllabus
// @route   POST /api/syllabus/section
// @access  Private
export const createSection = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found for your subject' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const order = await Section.countDocuments({ roadmapId: contentId });

    const section = await Section.create({
      roadmapId: contentId,
      title: req.body.title,
      description: req.body.description || '',
      order: order + 1,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, section });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom section (and its topics, progress, notes, questions, problems)
// @route   DELETE /api/syllabus/section/:id
// @access  Private
export const deleteSection = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const section = await Section.findOne({ _id: req.params.id, roadmapId: contentId });
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    if (!section.createdBy || String(section.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Only custom sections you added can be deleted' });
    }

    const topicIds = await Topic.find({ sectionId: section._id }).distinct('_id');

    await Promise.all([
      SubTopic.deleteMany({ topicId: { $in: topicIds } }),
      Topic.deleteMany({ sectionId: section._id }),
      Progress.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
      Note.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
      Question.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
      Problem.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
    ]);
    await section.deleteOne();

    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the authenticated user's syllabus tree (Section -> Topic)
// @route   GET /api/syllabus
// @access  Private
export const getSyllabus = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found for your subject' });
    }

    const tree = await buildRoadmapTree(req.user._id, roadmap);
    res.json({ success: true, ...tree });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a section with its topics and progress
// @route   GET /api/syllabus/:sectionId
// @access  Private
export const getSection = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const section = await Section.findOne({ _id: req.params.sectionId, roadmapId: contentId });
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const topics = await Topic.find({ sectionId: section._id })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    const progress = await Progress.find({
      userId: req.user._id,
      topicId: { $in: topics.map((t) => t._id) },
    }).lean();
    const progressMap = new Map(progress.map((p) => [String(p.topicId), p]));

    const topicsWithProgress = topics.map((t) => ({
      ...t,
      completed: !!progressMap.get(String(t._id))?.completed,
      completedAt: progressMap.get(String(t._id))?.completedAt || null,
    }));

    const counted = topicsWithProgress.filter((t) => !t.optional);
    const total = counted.length;
    const completed = counted.filter((t) => t.completed).length;

    res.json({
      success: true,
      section: {
        ...section.toObject(),
        topics: topicsWithProgress,
        total,
        completed,
        progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a topic in a section
// @route   POST /api/syllabus/topic
// @access  Private
export const createTopic = async (req, res, next) => {
  try {
    const { sectionId, title, description } = req.body;
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const section = await Section.findOne({ _id: sectionId, roadmapId: contentId });
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const order = await Topic.countDocuments({ sectionId });

    const topic = await Topic.create({
      sectionId,
      roadmapId: contentId,
      title,
      description: description || '',
      order: order + 1,
      isCustom: true,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a topic
// @route   PUT /api/syllabus/topic/:id
// @access  Private
export const updateTopic = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const topic = await Topic.findOne({ _id: req.params.id, roadmapId: contentId });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    if (topic.isCustom && String(topic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this topic' });
    }

    topic.title = req.body.title || topic.title;
    topic.description = req.body.description ?? topic.description;
    await topic.save();

    res.json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a topic (and its progress, notes, questions, problems)
// @route   DELETE /api/syllabus/topic/:id
// @access  Private
export const deleteTopic = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const topic = await Topic.findOne({ _id: req.params.id, roadmapId: contentId });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    await Promise.all([
      SubTopic.deleteMany({ topicId: topic._id }),
      Progress.deleteMany({ userId: req.user._id, topicId: topic._id }),
      Note.deleteMany({ userId: req.user._id, topicId: topic._id }),
      Question.deleteMany({ userId: req.user._id, topicId: topic._id }),
      Problem.deleteMany({ userId: req.user._id, topicId: topic._id }),
    ]);
    await topic.deleteOne();

    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    next(error);
  }
};