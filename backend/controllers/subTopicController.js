import SubTopic from '../models/SubTopic.js';
import Topic from '../models/Topic.js';

const canAccessSubTopic = (st, userId) =>
  (!st.isCustom && !st.createdBy) || String(st.createdBy) === String(userId);

// @desc    Get subtopics for a topic (or all visible)
// @route   GET /api/subtopics?topicId=
// @access  Private
export const getSubTopics = async (req, res, next) => {
  try {
    const query = {
      $or: [{ isCustom: false, createdBy: null }, { isCustom: true, createdBy: req.user._id }],
    };
    if (req.query.topicId) {
      const topic = await Topic.findById(req.query.topicId);
      if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
      query.topicId = req.query.topicId;
    }

    const subtopics = await SubTopic.find(query).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: subtopics.length, subtopics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single subtopic
// @route   GET /api/subtopics/:id
// @access  Private
export const getSubTopic = async (req, res, next) => {
  try {
    const subtopic = await SubTopic.findById(req.params.id);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });
    if (!canAccessSubTopic(subtopic, req.user._id)) {
      return res.status(403).json({ success: false, message: 'SubTopic not found' });
    }
    res.json({ success: true, subtopic });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom subtopic under a topic
// @route   POST /api/subtopics
// @access  Private
export const createSubTopic = async (req, res, next) => {
  try {
    const { topicId, title, description, difficulty, estimatedTime, resourceUrl, resourceTitle, resourceType } = req.body;
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const order = await SubTopic.countDocuments({ topicId });
    const resources = [];
    if (resourceUrl) {
      resources.push({
        title: resourceTitle || resourceUrl,
        url: resourceUrl,
        type: resourceType || 'other',
      });
    }

    const subtopic = await SubTopic.create({
      topicId,
      title,
      description,
      difficulty: req.body.difficulty || 'medium',
      estimatedTime: req.body.estimatedTime || '',
      resources,
      order: order + 1,
      isCustom: true,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, subtopic });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a custom subtopic
// @route   PUT /api/subtopics/:id
// @access  Private
export const updateSubTopic = async (req, res, next) => {
  try {
    const subtopic = await SubTopic.findById(req.params.id);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });
    if (!subtopic.isCustom || String(subtopic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own custom subtopics' });
    }

    const patchable = ['title', 'description', 'difficulty', 'estimatedTime', 'resources'];
    patchable.forEach((field) => {
      if (req.body[field] !== undefined) subtopic[field] = req.body[field];
    });
    await subtopic.save();
    res.json({ success: true, subtopic });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom subtopic
// @route   DELETE /api/subtopics/:id
// @access  Private
export const deleteSubTopic = async (req, res, next) => {
  try {
    const subtopic = await SubTopic.findById(req.params.id);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });
    if (!subtopic.isCustom || String(subtopic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own custom subtopics' });
    }

    await subtopic.deleteOne();
    res.json({ success: true, message: 'SubTopic deleted' });
  } catch (error) {
    next(error);
  }
};