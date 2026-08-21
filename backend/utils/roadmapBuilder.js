import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
import SubTopic from '../models/SubTopic.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';

/**
 * Resolves the roadmap that owns content for a given roadmap.
 * Linked roadmaps share the template's content (progress is keyed by topic
 * id so it can never collide with other users).
 */
const contentRoadmapId = (roadmap) =>
  roadmap.linked && roadmap.sourceRoadmapId ? roadmap.sourceRoadmapId : roadmap._id;

const visibilityFilter = (userId) => ({ $or: [{ createdBy: null }, { createdBy: userId }] });

/**
 * Returns the sets of section/topic ids the user has removed from their own
 * syllabus. Deletion is a per-user soft-delete so the shared template content
 * is never touched.
 */
export const getHiddenIds = async (userId) => {
  const user = await User.findById(userId).select('hiddenSectionIds hiddenTopicIds hiddenSubTopicIds').lean();
  return {
    sections: new Set((user?.hiddenSectionIds || []).map(String)),
    topics: new Set((user?.hiddenTopicIds || []).map(String)),
    subtopics: new Set((user?.hiddenSubTopicIds || []).map(String)),
  };
};

const roundPct = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

/**
 * Builds the Section -> Topic -> SubTopic tree for a single roadmap and merges
 * the given user's progress. Topic completion is automatically derived from its
 * subtopics when the topic has any; otherwise the topic-level toggle is used.
 * Optional (advanced/project) content is included but excluded from totals so
 * it never counts toward progress. Content the user removed from their own
 * syllabus is excluded.
 */
export const buildRoadmapTree = async (userId, roadmap) => {
  const contentId = contentRoadmapId(roadmap);
  const visibility = visibilityFilter(userId);
  const hidden = await getHiddenIds(userId);

  const [rawSections, rawTopics, rawSubtopics, progress] = await Promise.all([
    Section.find({ roadmapId: contentId, ...visibility }).sort({ order: 1, createdAt: 1 }).lean(),
    Topic.find({ roadmapId: contentId, ...visibility }).sort({ order: 1, createdAt: 1 }).lean(),
    SubTopic.find({ roadmapId: contentId, ...visibility }).sort({ order: 1, createdAt: 1 }).lean(),
    Progress.find({ userId }).select('topicId subTopicId completed completedAt').lean(),
  ]);

  const sections = rawSections.filter((s) => !hidden.sections.has(String(s._id)));
  const topics = rawTopics.filter(
    (t) => !hidden.topics.has(String(t._id)) && !hidden.sections.has(String(t.sectionId))
  );
  const visibleTopicIds = new Set(topics.map((t) => String(t._id)));
  const subtopics = rawSubtopics.filter(
    (sub) =>
      visibleTopicIds.has(String(sub.topicId)) &&
      !hidden.subtopics.has(String(sub._id)) &&
      !hidden.topics.has(String(sub.topicId))
  );

  const topicProgress = new Map();
  const subProgress = new Map();
  progress.forEach((p) => {
    if (p.subTopicId) subProgress.set(String(p.subTopicId), p);
    else topicProgress.set(String(p.topicId), p);
  });

  const topicSubMap = new Map();
  subtopics.forEach((sub) => {
    const list = topicSubMap.get(String(sub.topicId)) || [];
    list.push(sub);
    topicSubMap.set(String(sub.topicId), list);
  });

  const topicMap = new Map(
    topics.map((t) => {
      const subs = topicSubMap.get(String(t._id)) || [];
      if (subs.length > 0) {
        const withProgress = subs.map((s) => {
          const prog = subProgress.get(String(s._id));
          return {
            ...s,
            completed: !!prog?.completed,
            completedAt: prog?.completedAt || null,
          };
        });
        const subDone = withProgress.filter((s) => s.completed).length;
        const allDone = subDone === withProgress.length;
        const lastCompletedAt = withProgress
          .filter((s) => s.completed)
          .map((s) => s.completedAt)
          .sort((a, b) => new Date(b) - new Date(a))[0] || null;
        return [
          String(t._id),
          {
            ...t,
            subtopics: withProgress,
            subtopicTotal: withProgress.length,
            subtopicDone: subDone,
            hasSubTopics: true,
            completed: allDone,
            completedAt: lastCompletedAt,
            progress: roundPct(subDone, withProgress.length),
          },
        ];
      }

      const prog = topicProgress.get(String(t._id));
      const completed = !!prog?.completed;
      return [
        String(t._id),
        {
          ...t,
          subtopics: [],
          subtopicTotal: 0,
          subtopicDone: 0,
          hasSubTopics: false,
          completed,
          completedAt: prog?.completedAt || null,
          progress: completed ? 100 : 0,
        },
      ];
    })
  );

  let topicCount = 0;
  let completedCount = 0;

  const tree = sections.map((s) => {
    const sTopics = topics
      .filter((t) => String(t.sectionId) === String(s._id))
      .map((t) => topicMap.get(String(t._id)));

    const counted = sTopics.filter((t) => !t.optional);
    const total = counted.length;
    const completed = counted.filter((t) => t.completed).length;
    if (!s.optional) {
      topicCount += total;
      completedCount += completed;
    }

    return {
      ...s,
      topics: sTopics,
      total,
      completed,
      progress: roundPct(completed, total),
    };
  });

  return {
    roadmap: {
      id: roadmap._id,
      title: roadmap.title,
      description: roadmap.description,
      icon: roadmap.icon,
      subject: roadmap.subject,
      isTemplate: roadmap.isTemplate,
      sourceRoadmapId: roadmap.sourceRoadmapId,
    },
    sections: tree,
    totals: {
      topicsTotal: topicCount,
      topicsCompleted: completedCount,
      notStarted: topicCount - completedCount,
      overallProgress: roundPct(completedCount, topicCount),
    },
  };
};

export const getContentRoadmapId = contentRoadmapId;