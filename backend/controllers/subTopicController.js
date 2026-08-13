import SubTopic from '../models/SubTopic.js';
import Topic from '../models/Topic.js';
import Section from '../models/Section.js';
import Roadmap from '../models/Roadmap.js';
import Progress from '../models/Progress.js';

// @desc    Get subtopics for a topic
// @route   GET /api/subtopics?topicId=
// @access  Private
export const getSubTopics = async (req, res, next) => {
  try {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ success: false, message: 'topicId is required' });

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const section = await Section.findById(topic.sectionId);
    const roadmap = section ? await Roadmap.findById(section.roadmapId) : null;
    const visible =
      (roadmap && roadmap.isTemplate) ||
      (roadmap && String(roadmap.userId) === String(req.user._id)) ||
      (topic.createdBy && String(topic.createdBy) === String(req.user._id));
    if (!visible) return res.status(404).json({ success: false, message: 'Topic not found' });

    const subtopics = await SubTopic.find({ topicId }).sort({ order: 1, createdAt: 1 });
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

    const topic = await Topic.findById(subtopic.topicId);
    const section = topic ? await Section.findById(topic.sectionId) : null;
    const roadmap = section ? await Roadmap.findById(section.roadmapId) : null;
    const visible =
      (roadmap && roadmap.isTemplate) ||
      (roadmap && String(roadmap.userId) === String(req.user._id)) ||
      (subtopic.createdBy && String(subtopic.createdBy) === String(req.user._id));
    if (!visible) return res.status(404).json({ success: false, message: 'SubTopic not found' });

    res.json({ success: true, subtopic });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a subtopic under a topic
// @route   POST /api/subtopics
// @access  Private
export const createSubTopic = async (req, res, next) => {
  try {
    const { topicId, title, description, difficulty, estimatedTime, resourceUrl, resourceTitle, resourceType } = req.body;
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const section = await Section.findById(topic.sectionId);
    const roadmap = await Roadmap.findOne({ _id: section.roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

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
      roadmapId: roadmap._id,
      title,
      description: description || '',
      difficulty: difficulty || 'medium',
      estimatedTime: estimatedTime || '',
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

// @desc    Update a subtopic (official content may be renamed; custom by owner)
// @route   PUT /api/subtopics/:id
// @access  Private
export const updateSubTopic = async (req, res, next) => {
  try {
    const subtopic = await SubTopic.findById(req.params.id);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });

    if (subtopic.createdBy && String(subtopic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own subtopics' });
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

// @desc    Reorder subtopics within a topic
// @route   PUT /api/subtopics/reorder
// @access  Private
export const reorderSubTopics = async (req, res, next) => {
  try {
    const { orderedIds, topicId } = req.body;
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const section = await Section.findById(topic.sectionId);
    const roadmap = await Roadmap.findOne({ _id: section.roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const subtopics = await SubTopic.find({ topicId });
    const ownedIds = new Set(subtopics.map((s) => String(s._id)));
    const valid = orderedIds.every((id) => ownedIds.has(String(id)));
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid subtopic ids' });

    await Promise.all(
      orderedIds.map((id, index) => SubTopic.updateOne({ _id: id, topicId }, { $set: { order: index } }))
    );
    res.json({ success: true, message: 'SubTopics reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subtopic (only within user-owned roadmaps)
// @route   DELETE /api/subtopics/:id
// @access  Private
export const deleteSubTopic = async (req, res, next) => {
  try {
    const subtopic = await SubTopic.findById(req.params.id);
    if (!subtopic) return res.status(404).json({ success: false, message: 'SubTopic not found' });

    const topic = await Topic.findById(subtopic.topicId);
    const section = topic ? await Section.findById(topic.sectionId) : null;
    const roadmap = section ? await Roadmap.findOne({ _id: section.roadmapId, userId: req.user._id }) : null;
    if (!roadmap) return res.status(403).json({ success: false, message: 'You can only delete subtopics in your own roadmaps' });

    await Progress.deleteMany({ userId: req.user._id, subTopicId: subtopic._id });
    await subtopic.deleteOne();
    res.json({ success: true, message: 'SubTopic deleted' });
  } catch (error) {
    next(error);
  }
};
