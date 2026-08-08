import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  BookOpen,
  CheckCircle2,
  Clock3,
  CircleDot,
  ArrowRight,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { CircularProgress, StatusBadge } from '../components/ProgressCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { EmptyState, Spinner } from '../components/Loading.jsx';
import { timeAgo } from '../utils/index.js';

export const Dashboard = () => {
  const { user } = useAuth();
  const { stats, activity, tree } = useProgress();

  const firstName = (user?.name || '').split(' ')[0];
  const progress = stats?.totals?.overallProgress ?? 0;

  const continueLearning = useMemo(() => {
    if (!tree) return null;
    let best = null;
    for (const module of tree.modules) {
      for (const topic of module.topics) {
        for (const st of topic.subtopics) {
          if (st.status === 'in_progress') {
            if (!best || new Date(st.updatedAt || 0) > new Date(best.sub.updatedAt || 0)) {
              best = { module, topic, sub: st };
            }
          }
        }
      }
    }
    return best;
  }, [tree]);

  const recentActivity = useMemo(() => {
    if (!tree) return [];
    const done = [];
    for (const module of tree.modules) {
      for (const topic of module.topics) {
        for (const st of topic.subtopics) {
          if (st.status === 'completed' && st.completedAt) {
            done.push({ ...st, moduleTitle: module.title, topicTitle: topic.title });
          }
        }
      }
    }
    return done.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 6);
  }, [tree]);

  if (!stats && !tree) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Hi {firstName || 'there'} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here's how your MERN journey is going.</p>
      </motion.div>

      {/* Top metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Completed" value={stats?.totals?.completed ?? 0} sub={stats?.totals ? `${stats.totals.completed} / ${stats.totals.total}` : ''} icon={CheckCircle2} accent="from-emerald-500 to-teal-600" />
        <MetricCard label="In Progress" value={stats?.totals?.inProgress ?? 0} sub="actively learning" icon={Clock3} accent="from-amber-500 to-orange-600" />
        <MetricCard label="Not Started" value={stats?.totals?.notStarted ?? 0} sub="waiting for you" icon={CircleDot} accent="from-slate-400 to-slate-600" />
        <MetricCard label="Total Subtopics" value={stats?.totals?.total ?? 0} sub="across the syllabus" icon={BookOpen} accent="from-brand-500 to-indigo-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <ContinueCard data={continueLearning} />

        {/* Circular progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
        >
          <h2 className="text-sm font-semibold text-slate-600">Completion</h2>
          <div className="mt-4 flex items-center justify-center">
            <CircularProgress value={progress} label="complete" size={160} stroke={12} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-emerald-600">{stats?.totals?.completed ?? 0}</p>
              <p className="text-xs text-slate-500">Done</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-500">{stats?.totals?.inProgress ?? 0}</p>
              <p className="text-xs text-slate-500">Doing</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-400">{stats?.totals?.notStarted ?? 0}</p>
              <p className="text-xs text-slate-500">To do</p>
            </div>
          </div>
        </motion.div>

        {/* Streak + activity */}
        <StreakCard activity={activity} />
      </div>

      {/* Module progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-600">Module Progress</h2>
          <Link to="/syllabus" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            View syllabus <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {tree && tree.modules.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {tree.modules.map((module) => (
              <ModuleRow key={module._id} module={module} />
            ))}
          </div>
        ) : (
          <EmptyState title="No modules yet" message="The syllabus appears to be empty." />
        )}
      </motion.div>

      {/* Recent completed */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
      >
        <h2 className="text-sm font-semibold text-slate-600">Recently Completed</h2>
        {recentActivity.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {recentActivity.map((st) => (
              <li key={`${st._id}-${st.completedAt}`} className="flex items-center justify-between py-3">
                <Link to={`/topic/${st.topicId}`} className="group flex min-w-0 items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-brand-600">
                      {st.title}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {st.moduleTitle} · {st.topicTitle}
                    </p>
                  </div>
                </Link>
                <span className="ml-3 shrink-0 text-xs text-slate-400">{timeAgo(st.completedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No completions yet — go tackle your first subtopic!</p>
        )}
      </motion.div>
    </div>
  );
};

const MetricCard = ({ label, value, sub, icon: Icon, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
  >
    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-3xl font-extrabold text-slate-800">{value}</p>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    {sub ? <p className="mt-0.5 text-xs text-slate-400">{sub}</p> : null}
  </motion.div>
);

const ModuleRow = ({ module }) => (
  <Link to={`/syllabus/${module._id}`} className="group block rounded-xl border border-slate-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/40">
    <div className="flex items-center justify-between gap-3">
      <p className="truncate text-sm font-semibold text-slate-700 group-hover:text-brand-700">
        {module.title}
        {module.isCustom ? <span className="ml-1.5 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">CUSTOM</span> : null}
      </p>
      <span className="shrink-0 text-sm font-bold text-slate-600">{module.progress}%</span>
    </div>
    <div className="mt-2.5 flex items-center gap-3">
      <div className="flex-1">
        <ProgressBar value={module.progress} size="sm" />
      </div>
      <span className="shrink-0 text-xs text-slate-400">
        {module.completed}/{module.total}
      </span>
    </div>
  </Link>
);

const ContinueCard = ({ data }) => {
  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-6"
      >
        <h2 className="text-sm font-semibold text-slate-600">Continue Learning</h2>
        <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Sparkles className="h-8 w-8 text-brand-400" />
          <p className="text-sm font-medium text-slate-700">Nothing in progress yet</p>
          <p className="text-xs text-slate-400">Pick a subtopic and mark it In Progress to see it here.</p>
          <Link
            to="/syllabus"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Explore syllabus <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    );
  }

  const { module, topic, sub } = data;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
    >
      <h2 className="text-sm font-semibold text-slate-600">Continue Learning</h2>
      <div className="mt-4 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{module.title}</p>
        <p className="mt-0.5 text-lg font-bold text-slate-800">{topic.title}</p>
        <p className="text-sm text-slate-500">{sub.title}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={sub.status} />
        <span className="text-xs text-slate-400">{timeAgo(sub.updatedAt)}</span>
      </div>
      <Link
        to={`/topic/${topic._id}`}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        <PlayCircle className="h-4 w-4" /> Continue Learning
      </Link>
    </motion.div>
  );
};

const Heatmap = ({ data }) => {
  if (!data || !data.length) return null;
  const max = Math.max(1, ...data.map((d) => d.count));
  const level = (count) => {
    if (count === 0) return 'bg-slate-100';
    const r = count / max;
    if (r < 0.35) return 'bg-brand-100';
    if (r < 0.7) return 'bg-brand-300';
    return 'bg-brand-500';
  };
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>{data.length} days of activity</span>
        <span className="flex items-center gap-1">
          less
          {['bg-slate-100', 'bg-brand-100', 'bg-brand-300', 'bg-brand-500'].map((c) => (
            <span key={c} className={`h-2.5 w-2.5 rounded-sm ${c}`} />
          ))}
          more
        </span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }}>
        {data.map((d) => (
          <div key={d.date} title={`${d.date} · ${d.count} activities`} className={`aspect-square rounded-[3px] ${level(d.count)}`} />
        ))}
      </div>
    </div>
  );
};

const StreakCard = ({ activity = null }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
  >
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-600">Learning Streak</h2>
      <Flame className="h-5 w-5 text-orange-500" />
    </div>
    <div className="mt-2 flex items-end justify-center gap-2">
      <span className="text-6xl font-extrabold text-slate-800">{activity?.streak?.current ?? 0}</span>
      <span className="mb-2 text-sm font-medium text-slate-500">day streak</span>
    </div>
    <p className="text-center text-xs text-slate-400">Longest: {activity?.streak?.longest ?? 0} days</p>
    {activity?.heatmap?.length ? <Heatmap data={activity.heatmap} /> : null}
  </motion.div>
);