import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import api, { getErrorMessage } from '../services/api.js';

const ProgressContext = createContext(null);

// ---------- recompute helpers ----------
const recomputeTopic = (topic, subtopics) => {
  const total = subtopics.length;
  const completed = subtopics.filter((s) => s.status === 'completed').length;
  const inProgress = subtopics.filter((s) => s.status === 'in_progress').length;
  return {
    ...topic,
    subtopics,
    total,
    completed,
    inProgress,
    progress: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};

const recomputeModule = (module, topics) => {
  const subtopicCount = topics.reduce((sum, t) => sum + t.subtopics.length, 0);
  const completedCount = topics.reduce((sum, t) => sum + t.completed, 0);
  const inProgressCount = topics.reduce((sum, t) => sum + t.inProgress, 0);
  return {
    ...module,
    topics,
    subtopicCount,
    completedCount,
    inProgressCount,
    total: subtopicCount,
    completed: completedCount,
    inProgress: inProgressCount,
    progress: subtopicCount === 0 ? 0 : Math.round((completedCount / subtopicCount) * 100),
  };
};

const recomputeTotals = (prevTree, modules) => {
  const total = modules.reduce((sum, m) => sum + m.subtopicCount, 0);
  const completed = modules.reduce((sum, m) => sum + m.completedCount, 0);
  const inProgress = modules.reduce((sum, m) => sum + m.inProgressCount, 0);
  return {
    ...prevTree,
    modules,
    totals: {
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      overallProgress: total === 0 ? 0 : Math.round((completed / total) * 100),
    },
  };
};

const applySubUpdate = (prevTree, subTopicId, updater) => {
  if (!prevTree) return prevTree;
  let anyModuleChanged = false;
  const modules = prevTree.modules.map((m) => {
    let anyTopicChanged = false;
    const topics = m.topics.map((t) => {
      let anySubChanged = false;
      const subtopics = t.subtopics.map((s) => {
        if (String(s._id) === String(subTopicId)) {
          anySubChanged = true;
          return updater(s);
        }
        return s;
      });
      if (anySubChanged) {
        anyTopicChanged = true;
        return recomputeTopic(t, subtopics);
      }
      return t;
    });
    if (anyTopicChanged) {
      anyModuleChanged = true;
      return recomputeModule(m, topics);
    }
    return m;
  });
  return anyModuleChanged ? recomputeTotals(prevTree, modules) : prevTree;
};

export const ProgressProvider = ({ children }) => {
  const [tree, setTree] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const refreshTree = useCallback(async () => {
    try {
      const { data } = await api.get('/modules/tree');
      setTree(data.tree);
      setError(null);
      return data.tree;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const { data } = await api.get('/progress/stats');
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const refreshActivity = useCallback(async () => {
    try {
      const { data } = await api.get('/progress/activity');
      setActivity(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshTree(), refreshStats(), refreshActivity()]);
    setLoading(false);
  }, [refreshTree, refreshStats, refreshActivity]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const updateStatus = useCallback(
    async (subTopicId, status) => {
      // Optimistic local update.
      setTree((prev) =>
        applySubUpdate(prev, subTopicId, (s) => {
          const now = new Date().toISOString();
          return {
            ...s,
            status,
            startedAt:
              s.startedAt || (status === 'in_progress' || status === 'completed' ? now : s.startedAt),
            completedAt: status === 'completed' ? now : status === 'in_progress' ? null : s.completedAt,
            updatedAt: now,
          };
        })
      );

      try {
        await api.put(`/progress/${subTopicId}`, { status });
        setVersion((v) => v + 1);
        refreshStats();
        refreshActivity();
      } catch (err) {
        await refreshTree(); // rollback to server truth
        setVersion((v) => v + 1);
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshStats, refreshActivity, refreshTree]
  );

  const saveNotes = useCallback(
    async (subTopicId, notes) => {
      try {
        const { data } = await api.post(`/progress/${subTopicId}/notes`, { notes });
        setVersion((v) => v + 1);
        refreshTree();
        return data;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTree]
  );

  // Bulk update all subtopics under a topic or module (direct check).
  const bulkUpdateStatus = useCallback(
    async (entity, id, status) => {
      try {
        await api.put(`/progress/${entity}/${id}`, { status });
        setVersion((v) => v + 1);
        await refreshTree();
        refreshStats();
        refreshActivity();
        return { ok: true };
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTree, refreshStats, refreshActivity]
  );

  // Wrap a syllabus mutation (create/edit/delete custom content) then refetch.
  const mutateSyllabus = useCallback(
    async (fn) => {
      try {
        const result = await fn();
        await refreshTree();
        await refreshStats();
        setVersion((v) => v + 1);
        return result;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
    [refreshTree, refreshStats]
  );

  const value = {
    tree,
    stats,
    activity,
    loading,
    error,
    version,
    refreshTree,
    refreshStats,
    refreshActivity,
    refreshAll,
    updateStatus,
    saveNotes,
    bulkUpdateStatus,
    mutateSyllabus,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
};