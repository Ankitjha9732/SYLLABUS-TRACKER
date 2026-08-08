import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Module from '../models/Module.js';

const canAccessTopic = (doc, userId) =>
  (!doc.isCustom && !doc.createdBy) || String(doc.createdBy) === String(userId);

// @desc    Get topics for a module (or all visible topics)
// @route   GET /api/topics?moduleId=
// @access  Private
export const getTopics = async (req, res, next) => {
  try {
    const query = {
      $or: [{ isCustom: false, createdBy: null }, { isCustom: true, createdBy: req.user._id }],
    };
    if (req.query.moduleId) {
      const module = await Module.findById(req.query.moduleId);
      if (!module) return res.status(404).json({ success: false, message: 'Module not found' });
      if (!canAccessTopic(module, req.user._id)) {
        return res.status(403).json({ success: false, message: 'Module not found' });
      }
      query.moduleId = req.query.moduleId;
    }

    const topics = await Topic.find(query).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: topics.length, topics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single topic with its subtopics and user progress
// @route   GET /api/topics/:id
// @access  Private
export const getTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    if (!canAccessTopic(topic, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Topic not found' });
    }

    const subtopics = await SubTopic.find({
      $or: [
        { topicId: topic._id, isCustom: false, createdBy: null },
        { topicId: topic._id, isCustom: true, createdBy: req.user._id },
      ],
    }).sort({ order: 1, createdAt: 1 });

    const module = await Module.findById(topic.moduleId).select('title description isCustom').lean();
    res.json({ success: true, topic, module, subtopics });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom topic inside a module
// @route   POST /api/topics
// @access  Private
export const createTopic = async (req, res, next) => {
  try {
    const { moduleId, title, description } = req.body;
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    const order = await Topic.countDocuments({
      moduleId,
      $or: [{ isCustom: false, createdBy: null }, { isCustom: true, createdBy: req.user._id }],
    });

    const topic = await Topic.create({
      moduleId,
      title,
      description,
      order: order + 1,
      isCustom: true,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a topic (official or user's own custom topic)
// @route   PUT /api/topics/:id
// @access  Private
export const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    // Official topics may be renamed by any user; custom topics only by their owner.
    if (topic.isCustom && String(topic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own custom topics' });
    }

    topic.title = req.body.title || topic.title;
    topic.description = req.body.description ?? topic.description;
    await topic.save();
    res.json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom topic and its subtopics
// @route   DELETE /api/topics/:id
// @access  Private
export const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    if (!topic.isCustom || String(topic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own custom topics' });
    }

    await SubTopic.deleteMany({ topicId: topic._id });
    await topic.deleteOne();
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    next(error);
  }
};