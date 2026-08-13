import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext(null);

const recomputeSection = (section) => {
  const counted = (section.topics || []).filter((t) => !t.optional);
  const total = counted.length;
  const completed = counted.filter((t) => t.completed).length;
  return {
    ...section,
    total,
    completed,
    progress: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};

const recomputeTotals = (sections) => {
  let total = 0;
  let completed = 0;
  sections.forEach((s) => {
    if (s.optional) return;
    (s.topics || []).forEach((t) => {
      if (t.optional) return;
      total += 1;
      if (t.completed) completed += 1;
    });
  });
  return {
    topicsTotal: total,
    topicsCompleted: completed,
    notStarted: total - completed,
    overallProgress: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [syllabus, setSyllabus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshSyllabus = useCallback(async () => {
    try {
      const { data } = await api.get('/syllabus');
      setSyllabus(data);
      setError(null);
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const { data } = await api.get('/progress/stats');
      setStats(data.stats);
      setError(null);
      return data.stats;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshSyllabus(), refreshStats()]);
    setLoading(false);
  }, [refreshSyllabus, refreshStats]);

  useEffect(() => {
    setSyllabus(null);
    setStats(null);
    setError(null);
    refreshAll();
  }, [user?.id]);

  const applyTopicUpdate = (prev, topicId, updater) => {
    if (!prev) return prev;
    let anyChanged = false;
    const sections = prev.sections.map((s) => {
      let sChanged = false;
      const topics = s.topics.map((t) => {
        if (String(t._id) === String(topicId)) {
          sChanged = true;
          return updater(t);
        }
        return t;
      });
      if (sChanged) {
        anyChanged = true;
        return recomputeSection({ ...s, topics });
      }
      return s;
    });
    return anyChanged
      ? { ...prev, sections, totals: recomputeTotals(sections) }
      : prev;
  };

  // @desc  Toggle a single topic's completion (optimistic)
  const updateTopicStatus = useCallback(
    async (topicId, completed) => {
      setSyllabus((prev) =>
        applyTopicUpdate(prev, topicId, (t) => ({
          ...t,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        }))
      );
      try {
        await api.put(`/progress/topic/${topicId}`, { completed });
        await refreshStats();
      } catch (err) {
        await Promise.all([refreshSyllabus(), refreshStats()]);
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshSyllabus, refreshStats]
  );

  // @desc  Toggle every non-optional topic in a section at once (optimistic)
  const toggleSectionTopics = useCallback(
    async (sectionId, completed) => {
      const section = syllabus?.sections?.find((s) => String(s._id) === String(sectionId));
      const targets = (section?.topics || []).filter((t) => !t.optional);
      if (!targets.length) return;

      const next = completed === true;
      setSyllabus((prev) => {
        if (!prev) return prev;
        const sections = prev.sections.map((s) => {
          if (String(s._id) !== String(sectionId)) return s;
          const now = new Date().toISOString();
          return recomputeSection({
            ...s,
            topics: s.topics.map((t) =>
              t.optional ? t : { ...t, completed: next, completedAt: next ? now : null }
            ),
          });
        });
        return { ...prev, sections, totals: recomputeTotals(sections) };
      });

      try {
        await Promise.all(targets.map((t) => api.put(`/progress/topic/${t._id}`, { completed: next })));
        await refreshStats();
      } catch (err) {
        await Promise.all([refreshSyllabus(), refreshStats()]);
        throw new Error(getErrorMessage(err));
      }
    },
    [syllabus, refreshSyllabus, refreshStats]
  );

  // ---------- syllabus content mutations ----------
  const refreshTreeAfterMutation = useCallback(
    async (result) => {
      await Promise.all([refreshSyllabus(), refreshStats()]);
      return result;
    },
    [refreshSyllabus, refreshStats]
  );

  const createSection = useCallback(
    async ({ title, description = '' }) => {
      try {
        const { data } = await api.post('/syllabus/section', { title, description });
        await refreshTreeAfterMutation();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTreeAfterMutation]
  );

  const createTopic = useCallback(
    async ({ sectionId, title, description = '' }) => {
      try {
        const { data } = await api.post('/syllabus/topic', { sectionId, title, description });
        await refreshTreeAfterMutation();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTreeAfterMutation]
  );

  const updateTopic = useCallback(
    async (id, { title, description = '' }) => {
      try {
        const { data } = await api.put(`/syllabus/topic/${id}`, { title, description });
        await refreshTreeAfterMutation();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTreeAfterMutation]
  );

  const deleteTopic = useCallback(
    async (id) => {
      try {
        const { data } = await api.delete(`/syllabus/topic/${id}`);
        await refreshTreeAfterMutation();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTreeAfterMutation]
  );

  const deleteSection = useCallback(
    async (id) => {
      try {
        const { data } = await api.delete(`/syllabus/section/${id}`);
        await refreshTreeAfterMutation();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTreeAfterMutation]
  );

  // ---------- topic detail ----------
  const fetchTopicDetail = useCallback(async (topicId) => {
    const { data } = await api.get(`/topics/${topicId}/detail`);
    return data;
  }, []);

  // After any local content mutation, refresh global stats so dashboard counts
  // stay accurate (notes / questions / problems totals live in stats).
  const mutateStats = useCallback(
    async (result) => {
      await refreshStats();
      return result;
    },
    [refreshStats]
  );

  // ---------- notes ----------
  const createNote = useCallback(
    async (topicId, content) => {
      try {
        const { data } = await api.post(`/topics/${topicId}/notes`, { content });
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  const updateNote = useCallback(
    async (noteId, content) => {
      try {
        const { data } = await api.put(`/topics/notes/${noteId}`, { content });
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  const deleteNote = useCallback(
    async (noteId) => {
      try {
        const { data } = await api.delete(`/topics/notes/${noteId}`);
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  // ---------- questions ----------
  const createQuestion = useCallback(
    async (topicId, question) => {
      try {
        const { data } = await api.post(`/topics/${topicId}/questions`, { question });
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  const updateQuestion = useCallback(
    async (questionId, patch) => {
      try {
        const { data } = await api.put(`/topics/questions/${questionId}`, patch);
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  const deleteQuestion = useCallback(
    async (questionId) => {
      try {
        const { data } = await api.delete(`/topics/questions/${questionId}`);
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  // ---------- problems (DSA) ----------
  const createProblem = useCallback(
    async (topicId, payload) => {
      try {
        const { data } = await api.post(`/topics/${topicId}/problems`, payload);
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  const updateProblem = useCallback(
    async (problemId, patch) => {
      try {
        const { data } = await api.put(`/topics/problems/${problemId}`, patch);
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  const deleteProblem = useCallback(
    async (problemId) => {
      try {
        const { data } = await api.delete(`/topics/problems/${problemId}`);
        await mutateStats();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [mutateStats]
  );

  const value = {
    syllabus,
    stats,
    loading,
    error,
    refreshSyllabus,
    refreshStats,
    refreshAll,
    updateTopicStatus,
    toggleSectionTopics,
    createSection,
    createTopic,
    updateTopic,
    deleteTopic,
    deleteSection,
    fetchTopicDetail,
    createNote,
    updateNote,
    deleteNote,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createProblem,
    updateProblem,
    deleteProblem,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};