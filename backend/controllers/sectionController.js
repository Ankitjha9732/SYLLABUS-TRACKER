import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Roadmap from '../models/Roadmap.js';

const isTemplateContent = (section) => !section.createdBy;

// @desc    Get all visible sections for a roadmap
// @route   GET /api/sections?roadmapId=
// @access  Private
export const getSections = async (req, res, next) => {
  try {
    const { roadmapId } = req.query;
    if (!roadmapId) return res.status(400).json({ success: false, message: 'roadmapId is required' });

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    const visible = roadmap.isTemplate || String(roadmap.userId) === String(req.user._id);
    if (!visible) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const sections = await Section.find({ roadmapId }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: sections.length, sections });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single section with topics
// @route   GET /api/sections/:id
// @access  Private
export const getSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const roadmap = await Roadmap.findById(section.roadmapId);
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    const visible = roadmap.isTemplate || String(roadmap.userId) === String(req.user._id);
    if (!visible) return res.status(404).json({ success: false, message: 'Section not found' });

    const topics = await Topic.find({ sectionId: section._id }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, section, topics });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a section inside a roadmap
// @route   POST /api/sections
// @access  Private
export const createSection = async (req, res, next) => {
  try {
    const { roadmapId, title, description } = req.body;
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const order = await Section.countDocuments({ roadmapId });
    const section = await Section.create({
      roadmapId,
      title,
      description: description || '',
      order: order + 1,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, section });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a section (official content may be renamed; custom by owner)
// @route   PUT /api/sections/:id
// @access  Private
export const updateSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    if (section.createdBy && String(section.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own sections' });
    }

    section.title = req.body.title || section.title;
    section.description = req.body.description ?? section.description;
    await section.save();
    res.json({ success: true, section });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder sections within a roadmap
// @route   PUT /api/sections/reorder
// @access  Private
export const reorderSections = async (req, res, next) => {
  try {
    const { orderedIds, roadmapId } = req.body;
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const sections = await Section.find({ roadmapId });
    const ownedIds = new Set(sections.map((s) => String(s._id)));
    const valid = orderedIds.every((id) => ownedIds.has(String(id)));
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid section ids' });

    await Promise.all(
      orderedIds.map((id, index) => Section.updateOne({ _id: id, roadmapId }, { $set: { order: index } }))
    );
    res.json({ success: true, message: 'Sections reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a section (only within user-owned roadmaps)
// @route   DELETE /api/sections/:id
// @access  Private
export const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const roadmap = await Roadmap.findOne({ _id: section.roadmapId, userId: req.user._id });
    if (!roadmap) return res.status(403).json({ success: false, message: 'You can only delete sections in your own roadmaps' });

    const topicIds = await Topic.find({ sectionId: section._id }).distinct('_id');
    await SubTopic.deleteMany({ topicId: { $in: topicIds } });
    await Topic.deleteMany({ sectionId: section._id });
    await section.deleteOne();

    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    next(error);
  }
};
