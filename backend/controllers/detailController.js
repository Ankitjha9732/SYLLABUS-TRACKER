import Roadmap from '../models/Roadmap.js';
import Topic from '../models/Topic.js';
import Progress from '../models/Progress.js';
import Note from '../models/Note.js';
import Question from '../models/Question.js';
import Problem from '../models/Problem.js';
import { getContentRoadmapId } from '../utils/roadmapBuilder.js';

const resolveTopic = async (userId, subject, topicId) => {
  const template = await Roadmap.findOne({ subject, isTemplate: true, linked: { $ne: true } });
  const linked = await Roadmap.findOne({ userId, linked: true, sourceRoadmapId: template?._id });
  if (!linked) return null;
  const contentId = getContentRoadmapId(linked);
  return Topic.findOne({ _id: topicId, roadmapId: contentId });
};

// @desc    Get a topic with all of its personal content
// @route   GET /api/topics/:topicId/detail
// @access  Private
export const getTopicDetail = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    const topic = await resolveTopic(userId, req.user.subject, topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    if (topic.createdBy && String(topic.createdBy) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Topic not found' });
    }

    const [progress, notes, questions, problems] = await Promise.all([
      Progress.findOne({ userId, topicId }),
      Note.find({ userId, topicId }).sort({ createdAt: -1 }).lean(),
      Question.find({ userId, topicId }).sort({ createdAt: 1 }).lean(),
      Problem.find({ userId, topicId }).sort({ createdAt: 1 }).lean(),
    ]);

    res.json({
      success: true,
      topic: {
        ...topic.toObject(),
        completed: !!progress?.completed,
        completedAt: progress?.completedAt || null,
        isDSA: req.user.subject === 'dsa',
      },
      notes,
      questions,
      problems,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const getNotes = async (req, res, next) => {
  try {
    if (!(await resolveTopic(req.user.id, req.user.subject, req.params.topicId))) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    const notes = await Note.find({ userId: req.user.id, topicId: req.params.topicId }).sort({ updatedAt: -1 });
    res.json({ success: true, count: notes.length, notes });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const topic = await resolveTopic(req.user.id, req.user.subject, req.params.topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const note = await Note.create({
      userId: req.user.id,
      topicId: topic._id,
      content: req.body.content,
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, userId: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    note.content = req.body.content;
    await note.save();
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.noteId, userId: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export const getQuestions = async (req, res, next) => {
  try {
    if (!(await resolveTopic(req.user.id, req.user.subject, req.params.topicId))) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    const questions = await Question.find({ userId: req.user.id, topicId: req.params.topicId }).sort({ createdAt: 1 });
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const topic = await resolveTopic(req.user.id, req.user.subject, req.params.topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const question = await Question.create({
      userId: req.user.id,
      topicId: topic._id,
      question: req.body.question,
      completed: req.body.completed === true,
    });
    res.status(201).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOne({ _id: req.params.questionId, userId: req.user.id });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    if (req.body.question !== undefined) question.question = req.body.question;
    if (req.body.completed !== undefined) question.completed = req.body.completed === true;
    await question.save();
    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOneAndDelete({ _id: req.params.questionId, userId: req.user.id });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Problems (DSA)
// ---------------------------------------------------------------------------

export const getProblems = async (req, res, next) => {
  try {
    if (!(await resolveTopic(req.user.id, req.user.subject, req.params.topicId))) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    const problems = await Problem.find({ userId: req.user.id, topicId: req.params.topicId }).sort({ createdAt: 1 });
    res.json({ success: true, count: problems.length, problems });
  } catch (error) {
    next(error);
  }
};

export const createProblem = async (req, res, next) => {
  try {
    const topic = await resolveTopic(req.user.id, req.user.subject, req.params.topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const { title, link, difficulty, note } = req.body;
    const problem = await Problem.create({
      userId: req.user.id,
      topicId: topic._id,
      title,
      link: link || '',
      difficulty: difficulty || 'medium',
      note: note || '',
      completed: req.body.completed === true,
    });
    res.status(201).json({ success: true, problem });
  } catch (error) {
    next(error);
  }
};

export const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.problemId, userId: req.user.id });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const patchable = ['title', 'link', 'difficulty', 'note'];
    patchable.forEach((field) => {
      if (req.body[field] !== undefined) problem[field] = req.body[field];
    });
    if (req.body.completed !== undefined) problem.completed = req.body.completed === true;
    await problem.save();
    res.json({ success: true, problem });
  } catch (error) {
    next(error);
  }
};

export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOneAndDelete({ _id: req.params.problemId, userId: req.user.id });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) {
    next(error);
  }
};