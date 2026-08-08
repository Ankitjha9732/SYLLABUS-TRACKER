import Module from '../models/Module.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import { buildSyllabusTree } from '../utils/syllabusBuilder.js';

// @desc    Get the full syllabus tree with progress for the user
// @route   GET /api/modules/tree
// @access  Private
export const getSyllabusTree = async (req, res, next) => {
  try {
    const tree = await buildSyllabusTree(req.user._id);
    res.json({ success: true, tree });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visible modules
// @route   GET /api/modules
// @access  Private
export const getModules = async (req, res, next) => {
  try {
    const modules = await Module.find({
      $or: [{ isCustom: false, createdBy: null }, { isCustom: true, createdBy: req.user._id }],
    }).sort({ order: 1, createdAt: 1 });

    res.json({ success: true, count: modules.length, modules });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single module
// @route   GET /api/modules/:id
// @access  Private
export const getModule = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    const isVisible =
      (!module.isCustom && !module.createdBy) || String(module.createdBy) === String(req.user._id);
    if (!isVisible) return res.status(403).json({ success: false, message: 'Module not found' });

    const topics = await Topic.find({ moduleId: module._id }).sort({ order: 1 });
    res.json({ success: true, module, topics });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom module
// @route   POST /api/modules
// @access  Private
export const createModule = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const order = await Module.countDocuments({ isCustom: true, createdBy: req.user._id });
    const module = await Module.create({
      title,
      description,
      order: order + 1,
      isCustom: true,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, module });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a module (official or user's own custom module)
// @route   PUT /api/modules/:id
// @access  Private
export const updateModule = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    // Official modules may be renamed by any user; custom modules only by their owner.
    if (module.isCustom && String(module.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own custom modules' });
    }

    module.title = req.body.title || module.title;
    module.description = req.body.description ?? module.description;
    await module.save();
    res.json({ success: true, module });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom module and its content
// @route   DELETE /api/modules/:id
// @access  Private
export const deleteModule = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    if (!module.isCustom || String(module.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own custom modules' });
    }

    const topicIds = await Topic.find({ moduleId: module._id }).distinct('_id');
    await SubTopic.deleteMany({ topicId: { $in: topicIds } });
    await Topic.deleteMany({ moduleId: module._id });
    await module.deleteOne();

    res.json({ success: true, message: 'Module deleted' });
  } catch (error) {
    next(error);
  }
};