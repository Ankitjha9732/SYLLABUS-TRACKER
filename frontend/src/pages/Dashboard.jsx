import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  CheckCircle2,
  Timer,
  ArrowRight,
  FileText,
  Circle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import api from '../services/api.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { Spinner } from '../components/Loading.jsx';
import { SUBJECTS, subjectLabel } from '../components/Sidebar.jsx';

const cardClass = 'rounded-2xl border border-[#D9E1DC] bg-white p-6 shadow-sm';

const CardTitle = ({ children }) => <h2 className="text-base font-semibold text-gray-900">{children}</h2>;

const GreenLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#146B3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f572f] focus:outline-none focus:ring-4 focus:ring-emerald-100"
  >
    {children}
  </Link>
);

const MiniRing = ({ value, size = 52 }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#DDF4E8" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#16834A" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#146B3A]">{value}%</span>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, right }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="flex items-center gap-4 rounded-2xl border border-[#D9E1DC] bg-white p-5 shadow-sm transition hover:shadow-md"
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F9F6] text-[#16834A]">
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-2xl font-extrabold leading-none text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      {sub ? <p className="mt-0.5 truncate text-xs text-gray-400">{sub}</p> : null}
    </div>
    {right}
  </motion.div>
);

const difficultyClass = (d) =>
  d === 'easy'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : d === 'hard'
    ? 'bg-rose-50 text-rose-600 ring-rose-200'
    : 'bg-amber-50 text-amber-700 ring-amber-200';

export const Dashboard = () => {
  const { user } = useAuth();
  const { syllabus, stats, loading } = useData();
  const [recent, setRecent] = useState({ notes: [], questions: [], problems: [] });
  const [recentLoading, setRecentLoading] = useState(true);

  const firstName = (user?.name || '').split(' ')[0];
  const subject = SUBJECTS[user?.subject] || SUBJECTS.mern;
  const subjectText = subjectLabel(user?.subject);
  const isDSA = user?.subject === 'dsa';
  const isPCB = user?.subject === 'pcb';
  const totals = stats?.totals;
  const progress = totals?.overallProgress ?? 0;
  const sections = stats?.sectionStats || syllabus?.sections || [];

  const SUBJECT_PREFIXES = ['Physics', 'Chemistry', 'Botany', 'Zoology'];
  const subjectAggs = SUBJECT_PREFIXES.map((prefix) => {
    const rows = sections.filter((s) => (s.title || '').startsWith(prefix) && !s.optional);
    const total = rows.reduce((n, s) => n + (s.total || 0), 0);
    const completed = rows.reduce((n, s) => n + (s.completed || 0), 0);
    return { label: prefix, total, completed, progress: total === 0 ? 0 : Math.round((completed / total) * 100) };
  });

  const nextTopic = useMemo(() => {
    for (const s of syllabus?.sections || []) {
      if (s.optional) continue;
      const t = (s.topics || []).find((x) => !x.optional && !x.completed);
      if (t) return { section: s, topic: t };
    }
    return null;
  }, [syllabus]);

  const weakTopics = useMemo(() => {
    const out = [];
    for (const s of syllabus?.sections || []) {
      (s.topics || []).forEach((t) => {
        if (t.weak) out.push({ topic: t, sectionTitle: s.title });
      });
    }
    return out.slice(0, 6);
  }, [syllabus]);

  const revisionTopics = useMemo(() => {
    const out = [];
    for (const s of syllabus?.sections || []) {
      (s.topics || []).forEach((t) => {
        if (t.revision && t.revision !== 'none') out.push({ topic: t, sectionTitle: s.title });
      });
    }
    return out.sort((a, b) => (a.topic.revision || '') < (b.topic.revision || '') ? 1 : -1).slice(0, 6);
  }, [syllabus]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setRecentLoading(true);
      try {
        const { data } = await api.get('/progress');
        const items = (data?.items || []).slice(0, 8);
        const meta = new Map(
          items.map((it) => [
            String(it.topic?.id),
            { topic: it.topic?.title, section: it.section?.title },
          ])
        );
        const results = await Promise.all(
          items
            .filter((it) => it.topic?.id)
            .map((it) => api.get(`/topics/${it.topic.id}/detail`).then((r) => r.data).catch(() => null))
        );
        if (!alive) return;

        const notes = [];
        const questions = [];
        const problems = [];
        results.forEach((d) => {
          if (!d) return;
          const m = meta.get(String(d.topic?._id)) || {};
          const topicTitle = m.topic || d.topic?.title || 'Topic';
          (d.notes || []).forEach((n) => notes.push({ ...n, topicTitle }));
          (d.questions || []).forEach((q) => questions.push({ ...q, topicTitle }));
          (d.problems || []).forEach((p) => problems.push({ ...p, topicTitle }));
        });
        notes.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        setRecent({
          notes: notes.slice(0, 3),
          questions: questions.slice(0, 3),
          problems: problems.slice(0, 3),
        });
      } catch {
        /* keep empty states */
      } finally {
        if (alive) setRecentLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [user?.id, stats?.totals]);

  if (loading || (!stats && !sections.length)) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Spinner />
          <span className="text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Welcome back, {firstName || 'there'} 👋
          </h1>
          <p className="mt-2 text-gray-500">Track your learning progress and keep moving forward.</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${subject.badge}`}>
          {subject.icon ? <subject.icon className="h-3.5 w-3.5" /> : null} {subjectText}
        </span>
      </motion.div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Overall Progress"
          value={`${progress}%`}
          sub={`of your ${subjectText} syllabus`}
          icon={Target}
          right={<MiniRing value={progress} />}
        />
        <StatCard
          label="Completed Topics"
          value={totals?.topicsCompleted ?? 0}
          sub={totals ? `${totals.topicsCompleted} / ${totals.topicsTotal} topics` : ''}
          icon={CheckCircle2}
        />
        <StatCard
          label="Remaining Topics"
          value={totals?.notStarted ?? 0}
          sub={totals ? `${totals.notStarted} topics left` : ''}
          icon={Timer}
        />
      </div>

      {/* Subject-wise progress (PCB) */}
      {isPCB ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className={cardClass}
        >
          <CardTitle>Subject-wise Progress</CardTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {subjectAggs.map((s) => (
              <div key={s.label} className="rounded-xl border border-[#E6EFE9] bg-[#F4F9F6] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{s.label}</span>
                  <span className="text-sm font-bold text-[#146B3A]">{s.progress}%</span>
                </div>
                <ProgressBar value={s.progress} size="sm" />
                <p className="mt-1.5 text-xs text-gray-400">
                  {s.completed}/{s.total} topics
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Overall progress + Continue learning */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${cardClass} flex flex-col lg:col-span-2`}
        >
          <CardTitle>Overall Progress</CardTitle>
          <div className="mt-4 flex flex-1 items-center rounded-xl bg-[#F4F9F6] p-5">
            <p className="shrink-0 text-5xl font-extrabold text-[#146B3A]">
              {progress}
              <span className="text-3xl">%</span>
            </p>
            <div className="ml-6 min-w-0 flex-1">
              <ProgressBar value={progress} size="lg" />
              <p className="mt-2 text-xs text-gray-500">
                {totals?.topicsCompleted ?? 0} of {totals?.topicsTotal ?? 0} topics completed
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {totals?.notStarted ?? 0} remaining · {sections.length} sections
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className={`${cardClass} flex flex-col`}
        >
          <CardTitle>Continue Learning</CardTitle>
          <div className="mt-4 flex flex-1 flex-col">
            {nextTopic ? (
              <>
                <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#146B3A] ring-1 ring-emerald-200">
                  {nextTopic.section.title}
                </span>
                <p className="mt-3 text-lg font-bold text-gray-900">{nextTopic.topic.title}</p>
                <p className="mt-1 text-xs text-gray-400">Not completed yet</p>
                <div className="mt-auto pt-5">
                  <GreenLink to={`/topics/${nextTopic.topic._id}`}>
                    Continue Learning <ArrowRight className="h-4 w-4" />
                  </GreenLink>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-[#16834A]" />
                <p className="mt-3 font-semibold text-gray-700">All caught up!</p>
                <p className="mt-1 text-xs text-gray-400">You&apos;ve completed every topic in your {subjectText} syllabus.</p>
                <Link to="/syllabus" className="mt-4 text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
                  Review your syllabus →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Your Syllabus + Recent Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cardClass}
        >
          <div className="flex items-center justify-between">
            <CardTitle>Your Syllabus</CardTitle>
            <Link to="/syllabus" className="text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {sections.length ? (
              sections.slice(0, 8).map((s) => (
                <Link
                  key={s.id || s._id}
                  to="/syllabus"
                  className="block rounded-xl border border-[#E6EFE9] p-3 transition hover:border-[#16834A]/40 hover:bg-[#F4F9F6]"
                >
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-gray-700">{s.title}</span>
                    <span className="shrink-0 pl-2 text-xs font-bold text-[#146B3A]">{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} size="sm" />
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400">No sections yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
        >
          <div className="flex items-center justify-between">
            <CardTitle>Recent Notes</CardTitle>
            <Link to="/syllabus" className="text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
                <Spinner /> Loading recent activity...
              </div>
            ) : recent.notes.length ? (
              recent.notes.map((n) => (
                <div key={n._id} className="rounded-xl border border-[#E6EFE9] p-3.5">
                  <p className="text-[11px] font-semibold text-[#16834A]">{n.topicTitle}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{n.content}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-[#F4F9F6] p-5 text-center">
                <FileText className="mx-auto h-8 w-8 text-[#16834A]/50" />
                <p className="mt-2 text-sm font-medium text-gray-600">No notes yet.</p>
                <p className="mt-0.5 text-xs text-gray-400">Start saving important concepts while learning.</p>
                <Link to="/syllabus" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
                  Add a Note →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Weak topics + Topics for revision (PCB) */}
      {isPCB ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={cardClass}
          >
            <div className="flex items-center justify-between">
              <CardTitle>Weak Topics</CardTitle>
              <Link to="/syllabus" className="text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {weakTopics.length ? (
                weakTopics.map(({ topic, sectionTitle }) => (
                  <Link
                    key={topic._id}
                    to={`/topics/${topic._id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/40 px-3.5 py-2.5 transition hover:bg-rose-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-700">{topic.title}</p>
                      <p className="text-[11px] text-gray-400">{sectionTitle}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600 ring-1 ring-rose-200">
                      Weak
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400">No weak topics yet. Mark a topic as weak from its topic page.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className={cardClass}
          >
            <div className="flex items-center justify-between">
              <CardTitle>Topics for Revision</CardTitle>
              <Link to="/syllabus" className="text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {revisionTopics.length ? (
                revisionTopics.map(({ topic, sectionTitle }) => (
                  <Link
                    key={topic._id}
                    to={`/topics/${topic._id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#E6EFE9] px-3.5 py-2.5 transition hover:bg-[#F4F9F6]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-700">{topic.title}</p>
                      <p className="text-[11px] text-gray-400">{sectionTitle}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#146B3A] ring-1 ring-emerald-200">
                      {topic.revision === 'first'
                        ? '1st Revision'
                        : topic.revision === 'second'
                        ? '2nd Revision'
                        : 'Final Revision'}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400">No topics in revision yet. Set a revision stage from a topic page.</p>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Interview Questions + DSA problems / Roadmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
        >
          <div className="flex items-center justify-between">
            <CardTitle>Interview Questions</CardTitle>
            <Link to="/syllabus" className="text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
              View all →
            </Link>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {totals?.questionsCompleted ?? 0} of {totals?.questionsTotal ?? 0} prepared
          </p>
          <div className="mt-4 space-y-3">
            {recentLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
                <Spinner /> Loading...
              </div>
            ) : recent.questions.length ? (
              recent.questions.map((q) => (
                <div key={q._id} className="flex items-start gap-3 rounded-xl border border-[#E6EFE9] p-3.5">
                  {q.completed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16834A]" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#16834A]">{q.topicTitle}</p>
                    <p className="mt-0.5 text-sm text-gray-700">{q.question}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-[#F4F9F6] p-5 text-center">
                <p className="text-sm font-medium text-gray-600">No questions yet.</p>
                <p className="mt-0.5 text-xs text-gray-400">Save important interview questions while learning.</p>
                <Link to="/syllabus" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
                  Add a Question →
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {isDSA ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={cardClass}
          >
            <div className="flex items-center justify-between">
              <CardTitle>Important Problems</CardTitle>
              <Link to="/syllabus" className="text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
                View all →
              </Link>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Solved: {totals?.problemsSolved ?? 0} / {totals?.problemsTotal ?? 0}
            </p>
            <div className="mt-4 space-y-3">
              {recentLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
                  <Spinner /> Loading...
                </div>
              ) : recent.problems.length ? (
                recent.problems.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 rounded-xl border border-[#E6EFE9] p-3.5">
                    {p.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16834A]" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-700">{p.title}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#16834A]">{p.topicTitle}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${difficultyClass(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-[#F4F9F6] p-5 text-center">
                  <p className="text-sm font-medium text-gray-600">No problems yet.</p>
                  <p className="mt-0.5 text-xs text-gray-400">Track important DSA problems here.</p>
                  <Link to="/syllabus" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#16834A] transition hover:text-[#0f572f]">
                    Add a Problem →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${cardClass} flex flex-col`}
          >
            <CardTitle>Your Roadmap</CardTitle>
            <div className="mt-4 flex-1">
              <p className="text-lg font-bold text-gray-900">{syllabus?.roadmap?.title || subjectText}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                {syllabus?.roadmap?.description || 'Follow the sections in order to keep your progress consistent.'}
              </p>
              <p className="mt-3 text-xs text-gray-400">
                {totals?.topicsTotal ?? 0} topics across {sections.length} sections
              </p>
            </div>
            <div className="mt-5">
              <GreenLink to="/syllabus">
                Open Syllabus <ArrowRight className="h-4 w-4" />
              </GreenLink>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
