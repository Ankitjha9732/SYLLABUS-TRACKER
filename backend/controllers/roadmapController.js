import mongoose from 'mongoose';
import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Progress from '../models/Progress.js';
import { buildRoadmapTree, buildRoadmapStats } from '../utils/roadmapBuilder.js';

// @desc    List the authenticated user's roadmaps
// @route   GET /api/roadmaps
// @access  Private
export const getMyRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id, isTemplate: false })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const withStats = await buildRoadmapStats(req.user.id, roadmaps);

    res.json({ success: true, count: withStats.length, roadmaps: withStats });
  } catch (error) {
    next(error);
  }
};

// @desc    List official templates (optionally filtered by field)
// @route   GET /api/roadmaps/templates
// @access  Private
export const getTemplates = async (req, res, next) => {
  try {
    const filter = { isTemplate: true };
    if (req.query.field) filter.field = req.query.field;

    const roadmaps = await Roadmap.find(filter).sort({ field: 1, title: 1 }).lean();
    const withStats = await buildRoadmapStats(req.user.id, roadmaps);

    res.json({ success: true, count: withStats.length, roadmaps: withStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single roadmap's full tree (sections/topics/subtopics + progress)
// @route   GET /api/roadmaps/:id
// @access  Private
export const getRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roadmap = await Roadmap.findById(id).lean();
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const visible =
      roadmap.isTemplate ||
      String(roadmap.userId) === String(req.user.id);
    if (!visible) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const tree = await buildRoadmapTree(req.user.id, roadmap);
    res.json({ success: true, ...tree });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom roadmap for the user
// @route   POST /api/roadmaps
// @access  Private
export const createRoadmap = async (req, res, next) => {
  try {
    const { title, description, icon, field, targetDate } = req.body;

    const count = await Roadmap.countDocuments({ userId: req.user.id, isTemplate: false });
    const roadmap = await Roadmap.create({
      title,
      description: description || '',
      icon: icon || 'Map',
      field: field || req.user.field || 'general',
      userId: req.user.id,
      isTemplate: false,
      targetDate: targetDate ? new Date(targetDate) : null,
      order: count,
    });

    res.status(201).json({ success: true, message: 'Roadmap created', roadmap });
  } catch (error) {
    next(error);
  }
};

// @desc    Clone a template (or another roadmap) into the user's roadmaps
// @route   POST /api/roadmaps/:id/clone
// @access  Private
export const cloneRoadmap = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const source = await Roadmap.findById(req.params.id).session(session).lean();
    if (!source) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    if (!source.isTemplate && String(source.userId) !== String(req.user.id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const count = await Roadmap.countDocuments({ userId: req.user.id, isTemplate: false });
    const clone = await Roadmap.create(
      [
        {
          title: source.title,
          description: source.description || '',
          icon: source.icon || 'Map',
          field: source.field,
          userId: req.user.id,
          isTemplate: false,
          sourceRoadmapId: source._id,
          targetDate: source.targetDate,
          order: count,
        },
      ],
      { session }
    );

    const newRoadmap = clone[0];
    const sourceContentId = source._id;

    const sections = await Section.find({ roadmapId: sourceContentId }).session(session).lean();
    const sectionIdMap = new Map();
    const sectionPromises = sections.map(async (s) => {
      const created = await Section.create(
        [{ roadmapId: newRoadmap._id, title: s.title, description: s.description || '', createdBy: req.user.id, order: s.order }],
        { session }
      );
      sectionIdMap.set(String(s._id), created[0]._id);
    });
    await Promise.all(sectionPromises);

    const topics = await Topic.find({ roadmapId: sourceContentId }).session(session).lean();
    const topicIdMap = new Map();
    const topicPromises = topics.map(async (t) => {
      const newSectionId = sectionIdMap.get(String(t.sectionId));
      const created = await Topic.create(
        [{ sectionId: newSectionId, roadmapId: newRoadmap._id, title: t.title, description: t.description || '', order: t.order }],
        { session }
      );
      topicIdMap.set(String(t._id), created[0]._id);
    });
    await Promise.all(topicPromises);

    const subtopics = await SubTopic.find({ roadmapId: sourceContentId }).session(session).lean();
    const subtopicPromises = subtopics.map(async (st) => {
      const newTopicId = topicIdMap.get(String(st.topicId));
      await SubTopic.create(
        [
          {
            topicId: newTopicId,
            roadmapId: newRoadmap._id,
            title: st.title,
            description: st.description || '',
            difficulty: st.difficulty || 'medium',
            estimatedTime: st.estimatedTime || '',
            resources: st.resources || [],
            order: st.order,
          },
        ],
        { session }
      );
    });
    await Promise.all(subtopicPromises);

    await session.commitTransaction();
    session.endSession();

    const tree = await buildRoadmapTree(req.user.id, newRoadmap);
    res.status(201).json({ success: true, message: 'Roadmap cloned', ...tree });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Update a user's roadmap (title/description/icon/field/targetDate)
// @route   PUT /api/roadmaps/:id
// @access  Private
export const updateRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user.id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const { title, description, icon, field, targetDate } = req.body;
    if (title) roadmap.title = title;
    if (typeof description === 'string') roadmap.description = description;
    if (icon) roadmap.icon = icon;
    if (field) roadmap.field = field;
    roadmap.targetDate = targetDate ? new Date(targetDate) : null;
    await roadmap.save();

    res.json({ success: true, message: 'Roadmap updated', roadmap });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder a user's roadmaps
// @route   PUT /api/roadmaps/reorder
// @access  Private
export const reorderRoadmaps = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    const roadmaps = await Roadmap.find({ userId: req.user.id, isTemplate: false });

    const ownedIds = new Set(roadmaps.map((r) => String(r._id)));
    const valid = orderedIds.every((id) => ownedIds.has(String(id)));
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid roadmap ids' });

    await Promise.all(
      orderedIds.map((id, index) =>
        Roadmap.updateOne({ _id: id, userId: req.user.id }, { $set: { order: index } })
      )
    );

    res.json({ success: true, message: 'Roadmaps reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user's roadmap (cascades sections/topics/subtopics/progress)
// @route   DELETE /api/roadmaps/:id
// @access  Private
export const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user.id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const sectionIds = await Section.find({ roadmapId: roadmap._id }).distinct('_id');
    const topicIds = await Topic.find({ roadmapId: roadmap._id }).distinct('_id');
    const subtopicIds = await SubTopic.find({ roadmapId: roadmap._id }).distinct('_id');

    await SubTopic.deleteMany({ _id: { $in: subtopicIds } });
    await Topic.deleteMany({ _id: { $in: topicIds } });
    await Section.deleteMany({ _id: { $in: sectionIds } });
    await Progress.deleteMany({ userId: req.user.id, roadmapId: roadmap._id });
    await roadmap.deleteOne();

    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    next(error);
  }
};
