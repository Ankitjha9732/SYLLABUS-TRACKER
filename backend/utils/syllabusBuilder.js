import Module from '../models/Module.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Progress from '../models/Progress.js';

/**
 * Builds the full syllabus tree for a given user.
 * - Includes all official (isCustom: false) content.
 * - Includes content created by the user.
 * - Merges the user's progress records against subtopics.
 * - Computes progress at subtopic, topic, module and overall level.
 */
export const buildSyllabusTree = async (userId) => {
  const [modules, topics, subtopics, progress, customTopics] = await Promise.all([
    Module.find({ isCustom: false, createdBy: null }).sort({ order: 1, createdAt: 1 }).lean(),
    Topic.find({ isCustom: false, createdBy: null }).sort({ order: 1, createdAt: 1 }).lean(),
    SubTopic.find({ isCustom: false, createdBy: null }).sort({ order: 1, createdAt: 1 }).lean(),
    Progress.find({ userId }).lean(),
    Topic.find({ isCustom: true, createdBy: userId }).sort({ order: 1, createdAt: 1 }).lean(),
  ]);

  const userModules = await Module.find({ isCustom: true, createdBy: userId })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  const userSubTopics = await SubTopic.find({ isCustom: true, createdBy: userId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const allModules = [...modules, ...userModules];
  const allTopics = [...topics, ...customTopics];
  const allSubTopics = [...subtopics, ...userSubTopics];

  const progressMap = new Map();
  progress.forEach((p) => progressMap.set(String(p.subTopicId), p));

  const subtopicMap = new Map();
  allSubTopics.forEach((st) => {
    subtopicMap.set(String(st._id), {
      ...st,
      resources: st.resources || [],
    });
  });

  const topicMap = new Map();
  allTopics.forEach((t) => topicMap.set(String(t._id), { ...t, subtopics: [] }));

  // attach subtopics to topics
  allSubTopics.forEach((st) => {
    const topic = topicMap.get(String(st.topicId));
    if (topic) {
      const prog = progressMap.get(String(st._id));
      topic.subtopics.push({
        ...st,
        status: prog ? prog.status : 'not_started',
        notes: prog ? prog.notes : '',
        startedAt: prog ? prog.startedAt : null,
        completedAt: prog ? prog.completedAt : null,
        updatedAt: prog ? prog.updatedAt : null,
      });
    }
  });

  const moduleMap = new Map();
  allModules.forEach((m) => moduleMap.set(String(m._id), { ...m, topics: [], subtopicCount: 0, completedCount: 0, inProgressCount: 0 }));

  // attach topics to modules, only keep modules that have visible topic set
  allTopics.forEach((t) => {
    if (moduleMap.has(String(t.moduleId))) {
      const topicRecord = topicMap.get(String(t._id));
      if (topicRecord) moduleMap.get(String(t.moduleId)).topics.push(topicRecord);
    }
  });

  // Only include subtopics whose topic is actually visible, ensure custom subtoptics under visible topics are included
  // compute progress counts
  const tree = Array.from(moduleMap.values()).map((m) => {
    m.topics.forEach((t) => {
      t.subtopics.sort((a, b) => a.order - b.order);
      const total = t.subtopics.length;
      const completed = t.subtopics.filter((s) => s.status === 'completed').length;
      const inProgress = t.subtopics.filter((s) => s.status === 'in_progress').length;
      t.total = total;
      t.completed = completed;
      t.inProgress = inProgress;
      t.progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      m.subtopicCount += total;
      m.completedCount += completed;
      m.inProgressCount += inProgress;
    });
    m.total = m.subtopicCount;
    m.completed = m.completedCount;
    m.inProgress = m.inProgressCount;
    m.progress = m.subtopicCount === 0 ? 0 : Math.round((m.completed / m.subtopicCount) * 100);
    return m;
  });

  const total = tree.reduce((sum, m) => sum + m.subtopicCount, 0);
  const completed = tree.reduce((sum, m) => sum + m.completedCount, 0);
  const inProgress = tree.reduce((sum, m) => sum + m.inProgressCount, 0);

  return {
    modules: tree.filter((m) => m.topics.length > 0 || m.isCustom),
    totals: {
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      overallProgress: total === 0 ? 0 : Math.round((completed / total) * 100),
    },
  };
};