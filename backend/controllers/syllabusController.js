import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
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
    const topicIds = topics.map((t) => t._id);
    const [progress, subtopics] = await Promise.all([
      Progress.find({ userId: req.user._id, topicId: { $in: topicIds } }).lean(),
      SubTopic.find({ topicId: { $in: topicIds } }).sort({ order: 1, createdAt: 1 }).lean(),
    ]);
    const topicMap = new Map();
    progress.forEach((p) => {
      const key = p.subTopicId ? `s:${String(p.subTopicId)}` : `t:${String(p.topicId)}`;
      topicMap.set(key, p);
    });
    const subByTopic = new Map();
    subtopics.forEach((sub) => {
      const list = subByTopic.get(String(sub.topicId)) || [];
      list.push(sub);
      subByTopic.set(String(sub.topicId), list);
    });

    const roundPct = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

    const topicsWithProgress = topics.map((t) => {
      const subs = subByTopic.get(String(t._id)) || [];
      if (subs.length > 0) {
        const merged = subs.map((s) => ({
          ...s,
          completed: !!topicMap.get(`s:${String(s._id)}`)?.completed,
        }));
        const subDone = merged.filter((s) => s.completed).length;
        const allDone = subDone === merged.length;
        return {
          ...t,
          subtopics: merged,
          subtopicTotal: merged.length,
          subtopicDone: subDone,
          hasSubTopics: true,
          completed: allDone,
          completedAt: topicMap.get(`s:${String(t._id)}`)?.completedAt || null,
          progress: roundPct(subDone, merged.length),
        };
      }
      const prog = topicMap.get(`t:${String(t._id)}`);
      return {
        ...t,
        subtopics: [],
        subtopicTotal: 0,
        subtopicDone: 0,
        hasSubTopics: false,
        completed: !!prog?.completed,
        completedAt: prog?.completedAt || null,
        progress: prog?.completed ? 100 : 0,
      };
    });

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
        progress: roundPct(completed, total),
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
    if (req.body.practice !== undefined) topic.practice = req.body.practice === true;
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
    const subTopicIds = await SubTopic.find({ topicId: topic._id }).distinct('_id');
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { hiddenTopicIds: topic._id, hiddenSubTopicIds: { $each: subTopicIds } } }
    );

    res.json({ success: true, message: 'Topic removed from your syllabus' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom subtopic inside the user's own syllabus
// @route   POST /api/syllabus/subtopic
// @access  Private
export const createSubTopic = async (req, res, next) => {
  try {
    const { topicId, title, description, difficulty, estimatedTime } = req.body;
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const topic = await Topic.findOne({ _id: topicId, roadmapId: contentId });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const order = await SubTopic.countDocuments({ topicId });

    const subtopic = await SubTopic.create({
      topicId,
      roadmapId: contentId,
      title,
      description: description || '',
      difficulty: difficulty || 'medium',
      estimatedTime: estimatedTime || '',
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
// @route   PUT /api/syllabus/subtopic/:id
// @access  Private
export const updateSubTopic = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const subtopic = await SubTopic.findOne({ _id: req.params.id, roadmapId: contentId });
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'SubTopic not found' });
    }

    if (subtopic.createdBy && String(subtopic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this subtopic' });
    }

    if (req.body.title !== undefined) subtopic.title = req.body.title;
    if (req.body.description !== undefined) subtopic.description = req.body.description;
    if (req.body.difficulty !== undefined) subtopic.difficulty = req.body.difficulty;
    if (req.body.estimatedTime !== undefined) subtopic.estimatedTime = req.body.estimatedTime;
    await subtopic.save();

    res.json({ success: true, subtopic });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a subtopic from the user's own syllabus (custom subtopics are
//          deleted; shared template content is soft-deleted per user)
// @route   DELETE /api/syllabus/subtopic/:id
// @access  Private
export const deleteSubTopic = async (req, res, next) => {
  try {
    const roadmap = await getUserSyllabusRoadmap(req.user._id, req.user.subject);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Syllabus not found' });
    }

    const contentId = getSyllabusContentId(roadmap);
    const subtopic = await SubTopic.findOne({ _id: req.params.id, roadmapId: contentId });
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'SubTopic not found' });
    }

    await Progress.deleteMany({ userId: req.user._id, subTopicId: subtopic._id });

    if (subtopic.isCustom && String(subtopic.createdBy) === String(req.user._id)) {
      await subtopic.deleteOne();
    } else {
      await User.updateOne({ _id: req.user._id }, { $addToSet: { hiddenSubTopicIds: subtopic._id } });
    }

    res.json({ success: true, message: 'SubTopic removed from your syllabus' });
  } catch (error) {
    next(error);
  }
};