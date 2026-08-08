import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Star,
  ExternalLink,
  Video,
  FileText,
  BookOpen,
  Github,
  Link2 as Link2Icon,
  Save,
  StickyNote,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { StatusSelector, CheckTopicButton } from '../components/ProgressCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import AddSubTopicModal from '../components/AddSubTopicModal.jsx';
import { Spinner } from '../components/Loading.jsx';
import API, { getErrorMessage } from '../services/api.js';

const RESOURCE_ICON = {
  video: Video,
  documentation: FileText,
  article: BookOpen,
  github: Github,
  other: Link2Icon,
};

export const TopicDetail = () => {
  const { topicId } = useParams();
  const toast = useToast();
  const { updateStatus, bulkUpdateStatus, mutateSyllabus } = useProgress();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [savingNotes, setSavingNotes] = useState({});
  const [showAddSub, setShowAddSub] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await API.get(`/topics/${topicId}`);
      setDetail(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [topicId]);

  const isCustomTopic = detail?.topic?.isCustom;

  const handleStatus = async (st, status) => {
    try {
      await updateStatus(st._id, status);
      // Keep the local detail view in sync so the UI reflects the change instantly.
      setDetail((d) => {
        if (!d) return d;
        const subtopics = d.subtopics.map((s) =>
          s._id === st._id ? { ...s, status } : s
        );
        return { ...d, subtopics };
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveNote = async (st) => {
    const value = drafts[st._id] ?? st.notes ?? '';
    setSavingNotes((s) => ({ ...s, [st._id]: true }));
    try {
      await mutateSyllabus(() =>
        API.post(`/progress/${st._id}/notes`, { notes: value }).then((r) => r.data)
      );
    } finally {
      setSavingNotes((s) => ({ ...s, [st._id]: false }));
    }
  };

  const handleBulk = async () => {
    const checkOff = percent < 100;
    setBulkBusy(true);
    try {
      await bulkUpdateStatus('topic', topicId, checkOff ? 'completed' : 'not_started');
      await load();
      toast.success(`Topic ${checkOff ? 'marked completed' : 'reset'}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm">Loading topic...</span>
        </div>
      </div>
    );
  }

  if (!detail || !detail.topic) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-xl font-bold text-slate-700">Topic not found</h1>
        <Link to="/syllabus" className="mt-2 inline-block text-sm text-brand-600 hover:text-brand-700">
          ← Back to syllabus
        </Link>
      </div>
    );
  }

  const { topic, module, subtopics } = detail;
  const total = subtopics.length;
  const completed = subtopics.filter((s) => s.status === 'completed').length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/syllabus" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to syllabus
      </Link>

      {/* Topic header */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
          {module?.title || 'Module'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-800">{topic.title}</h1>
          {isCustomTopic ? <CustomBadge /> : null}
        </div>
        {topic.description ? <p className="mt-2 text-sm text-slate-500">{topic.description}</p> : null}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">
              {completed} / {total} subtopics complete
            </span>
            <span className="flex items-center gap-2">
              <CheckTopicButton
                checked={total > 0 && percent === 100}
                partiallyChecked={percent > 0 && percent < 100}
                busy={bulkBusy}
                onClick={handleBulk}
              />
              <span className="font-bold text-brand-600">{percent}%</span>
            </span>
          </div>
          <ProgressBar value={percent} size="lg" />
        </div>
      </div>

      {/* Subtopics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Subtopics <span className="text-sm font-normal text-slate-400">({total})</span>
          </h2>
        </div>

        {subtopics.length ? (
          subtopics.map((st) => (
            <motion.div
              key={st._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
            >
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="w-full sm:w-32">
                  <StatusSelector
                    status={st.status}
                    onChange={(status) => handleStatus(st, status)}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${st.isCustom ? 'italic text-slate-600' : 'text-slate-800'}`}>
                    {st.title}
                  </p>
                  {st.description ? <p className="truncate text-xs text-slate-400">{st.description}</p> : null}
                </div>
                {st.isCustom ? <CustomBadge /> : null}
                <span className="rounded-lg border border-slate-100 px-1.5 py-0.5 text-xs capitalize text-slate-400">
                  {st.difficulty}
                </span>
                {st.estimatedTime ? (
                  <span className="rounded-lg border border-slate-100 px-1.5 py-0.5 text-xs text-slate-400">
                    ⏱ {st.estimatedTime}
                  </span>
                ) : null}
              </div>

              {st.resources?.length ? (
                <div className="border-t border-slate-50 px-4 py-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Resources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {st.resources.map((r, i) => {
                      const Icon = RESOURCE_ICON[r.type] || Link2Icon;
                      return (
                        <a
                          key={`${r.url}-${i}`}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
                        >
                          <Icon className="h-3.5 w-3.5" /> {r.title}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Notes */}
              <div className="border-t border-slate-50 bg-slate-50/60 px-4 py-3">
                <div className="flex items-start gap-3">
                  <StickyNote className="mt-2.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <textarea
                      value={drafts[st._id] !== undefined ? drafts[st._id] : st.notes || ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [st._id]: e.target.value }))}
                      rows={2}
                      placeholder="Add personal notes for this subtopic..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(st)}
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingNotes[st._id] ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
            No subtopics yet. Add your first one below.
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowAddSub(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          <Plus className="h-4 w-4" /> Add Subtopic
        </button>
      </div>

      <AddSubTopicModal
        open={showAddSub}
        onClose={() => setShowAddSub(false)}
        onAdd={async (form) => {
          try {
            await mutateSyllabus(() => API.post('/subtopics', { topicId, ...form }).then((r) => r.data));
            toast.success('Subtopic added');
            await load();
          } catch (err) {
            const message = getErrorMessage(err);
            toast.error(message);
            throw new Error(message);
          }
        }}
      />
    </div>
  );
};

const CustomBadge = () => (
  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">
    <Star className="h-2.5 w-2.5" /> Custom
  </span>
);