import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import Progress from '../models/Progress.js';
import Note from '../models/Note.js';
import Question from '../models/Question.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { buildRoadmapTree, getContentRoadmapId, getHiddenIds } from '../utils/roadmapBuilder.js';

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

// @desc    Remove a section from the user's own syllabus (soft delete; the
//          shared template content stays intact for other/new accounts)
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

    const topicIds = await Topic.find({ sectionId: section._id }).distinct('_id');

    await Promise.all([
      Progress.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
      Note.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
      Question.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
      Problem.deleteMany({ userId: req.user._id, topicId: { $in: topicIds } }),
    ]);
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { hiddenSectionIds: section._id, hiddenTopicIds: { $each: topicIds } } }
    );

    res.json({ success: true, message: 'Section removed from your syllabus' });
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

    const hidden = await getHiddenIds(req.user._id);
    if (hidden.sections.has(String(section._id))) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const topics = (await Topic.find({ sectionId: section._id })
      .sort({ order: 1, createdAt: 1 })
      .lean()).filter((t) => !hidden.topics.has(String(t._id)));
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
    if (req.body.priority !== undefined) topic.priority = req.body.priority;
    if (req.body.revision !== undefined) topic.revision = req.body.revision;
    if (req.body.weak !== undefined) topic.weak = req.body.weak === true;
    await topic.save();

    res.json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a topic from the user's own syllabus (soft delete; the
//          shared template content stays intact for other/new accounts)
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
      Progress.deleteMany({ userId: req.user._id, topicId: topic._id }),
      Note.deleteMany({ userId: req.user._id, topicId: topic._id }),
      Question.deleteMany({ userId: req.user._id, topicId: topic._id }),
      Problem.deleteMany({ userId: req.user._id, topicId: topic._id }),
    ]);
    await User.updateOne({ _id: req.user._id }, { $addToSet: { hiddenTopicIds: topic._id } });

    res.json({ success: true, message: 'Topic removed from your syllabus' });
  } catch (error) {
    next(error);
  }
};