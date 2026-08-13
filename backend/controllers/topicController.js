import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Section from '../models/Section.js';
import Roadmap from '../models/Roadmap.js';

const isTemplateContent = (topic) => !topic.createdBy;

// @desc    Get topics for a section (or all visible topics)
// @route   GET /api/topics?sectionId=
// @access  Private
export const getTopics = async (req, res, next) => {
  try {
    const { sectionId } = req.query;
    if (!sectionId) return res.status(400).json({ success: false, message: 'sectionId is required' });

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const roadmap = await Roadmap.findById(section.roadmapId);
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    const visible = roadmap.isTemplate || String(roadmap.userId) === String(req.user._id);
    if (!visible) return res.status(404).json({ success: false, message: 'Section not found' });

    const topics = await Topic.find({ sectionId }).sort({ order: 1, createdAt: 1 });
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

    const section = await Section.findById(topic.sectionId);
    const roadmap = section ? await Roadmap.findById(section.roadmapId) : null;
    const visible =
      (roadmap && roadmap.isTemplate) ||
      (roadmap && String(roadmap.userId) === String(req.user._id)) ||
      (topic.createdBy && String(topic.createdBy) === String(req.user._id));
    if (!visible) return res.status(404).json({ success: false, message: 'Topic not found' });

    const subtopics = await SubTopic.find({ topicId: topic._id }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, topic, section: section ? { id: section._id, title: section.title } : null, subtopics });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a topic inside a section
// @route   POST /api/topics
// @access  Private
export const createTopic = async (req, res, next) => {
  try {
    const { sectionId, title, description } = req.body;
    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const roadmap = await Roadmap.findOne({ _id: section.roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const order = await Topic.countDocuments({ sectionId });
    const topic = await Topic.create({
      sectionId,
      roadmapId: roadmap._id,
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

// @desc    Update a topic (official content may be renamed; custom by owner)
// @route   PUT /api/topics/:id
// @access  Private
export const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    if (topic.createdBy && String(topic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own topics' });
    }

    topic.title = req.body.title || topic.title;
    topic.description = req.body.description ?? topic.description;
    await topic.save();
    res.json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder topics within a section
// @route   PUT /api/topics/reorder
// @access  Private
export const reorderTopics = async (req, res, next) => {
  try {
    const { orderedIds, sectionId } = req.body;
    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const roadmap = await Roadmap.findOne({ _id: section.roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const topics = await Topic.find({ sectionId });
    const ownedIds = new Set(topics.map((t) => String(t._id)));
    const valid = orderedIds.every((id) => ownedIds.has(String(id)));
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid topic ids' });

    await Promise.all(
      orderedIds.map((id, index) => Topic.updateOne({ _id: id, sectionId }, { $set: { order: index } }))
    );
    res.json({ success: true, message: 'Topics reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a topic and its subtopics (only within user-owned roadmaps)
// @route   DELETE /api/topics/:id
// @access  Private
export const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const section = await Section.findById(topic.sectionId);
    const roadmap = section ? await Roadmap.findOne({ _id: section.roadmapId, userId: req.user._id }) : null;
    if (!roadmap) return res.status(403).json({ success: false, message: 'You can only delete topics in your own roadmaps' });

    await SubTopic.deleteMany({ topicId: topic._id });
    await topic.deleteOne();
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    next(error);
  }
};
