import Roadmap from '../models/Roadmap.js';
import Section from '../models/Section.js';
import Topic from '../models/Topic.js';
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
  const user = await User.findById(userId).select('hiddenSectionIds hiddenTopicIds').lean();
  return {
    sections: new Set((user?.hiddenSectionIds || []).map(String)),
    topics: new Set((user?.hiddenTopicIds || []).map(String)),
  };
};

/**
 * Builds the Section -> Topic tree for a single roadmap and merges the given
 * user's topic-level progress. Optional (advanced) content is included but
 * excluded from totals so it never counts toward progress. Sections and topics
 * the user deleted from their own syllabus are excluded.
 */
export const buildRoadmapTree = async (userId, roadmap) => {
  const contentId = contentRoadmapId(roadmap);
  const visibility = visibilityFilter(userId);
  const hidden = await getHiddenIds(userId);

  const [rawSections, rawTopics, progress] = await Promise.all([
    Section.find({ roadmapId: contentId, ...visibility }).sort({ order: 1, createdAt: 1 }).lean(),
    Topic.find({ roadmapId: contentId, ...visibility }).sort({ order: 1, createdAt: 1 }).lean(),
    Progress.find({ userId }).select('topicId completed completedAt').lean(),
  ]);

  const sections = rawSections.filter((s) => !hidden.sections.has(String(s._id)));
  const topics = rawTopics.filter(
    (t) => !hidden.topics.has(String(t._id)) && !hidden.sections.has(String(t.sectionId))
  );

  const progressMap = new Map(progress.map((p) => [String(p.topicId), p]));
  const topicMap = new Map(
    topics.map((t) => {
      const prog = progressMap.get(String(t._id));
      return [
        String(t._id),
        {
          ...t,
          completed: !!prog?.completed,
          completedAt: prog?.completedAt || null,
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
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
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
      overallProgress: topicCount === 0 ? 0 : Math.round((completedCount / topicCount) * 100),
    },
  };
};

export const getContentRoadmapId = contentRoadmapId;