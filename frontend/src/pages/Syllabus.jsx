import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  List,
  Star,
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import AddTopicModal from '../components/AddTopicModal.jsx';
import AddSubTopicModal from '../components/AddSubTopicModal.jsx';
import AddModuleModal from '../components/AddModuleModal.jsx';
import EditTopicModal from '../components/EditTopicModal.jsx';
import EditSubTopicModal from '../components/EditSubTopicModal.jsx';
import EditModuleModal from '../components/EditModuleModal.jsx';
import ActionMenu from '../components/ActionMenu.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Spinner } from '../components/Loading.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { StepStatusButton, CheckTopicButton } from '../components/ProgressCard.jsx';
import { nextStatus } from '../utils/index.js';
import API, { getErrorMessage } from '../services/api.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'custom', label: 'Custom' },
];

const DIFFICULTIES = [
  { value: 'all', label: 'All difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const Syllabus = () => {
  const { tree, loading, updateStatus, bulkUpdateStatus, mutateSyllabus } = useProgress();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [filter, setFilter] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const [expandedModules, setExpandedModules] = useState(() => new Set());
  const toggleModule = (id) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [addTopicFor, setAddTopicFor] = useState(null);
  const [addSubFor, setAddSubFor] = useState(null);
  const [addModuleOpen, setAddModuleOpen] = useState(false);

  // edit/delete state for custom content
  const [editModule, setEditModule] = useState(null);
  const [editTopic, setEditTopic] = useState(null);
  const [editSub, setEditSub] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const modules = tree?.modules || [];
  const totals = tree?.totals;

  const filteredModules = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q && filter === 'all' && difficulty === 'all') return modules;

    return modules
      .map((module) => {
        const topics = module.topics
          .filter((topic) => {
            if (!q || `${topic.title} ${module.title}`.toLowerCase().includes(q)) return true;
            return topic.subtopics.some((st) => `${st.title} ${st.description || ''}`.toLowerCase().includes(q));
          })
          .map((topic) => {
            const subs = topic.subtopics.filter((st) => {
              if (q) {
                const hay = `${st.title} ${st.description || ''} ${topic.title}`.toLowerCase();
                if (!hay.includes(q)) return false;
              }
              if (difficulty !== 'all' && st.difficulty !== difficulty) return false;
              if (filter === 'custom' && !st.isCustom) return false;
              if (filter === 'not_started' && st.status !== 'not_started') return false;
              if (filter === 'in_progress' && st.status !== 'in_progress') return false;
              if (filter === 'completed' && st.status !== 'completed') return false;
              return true;
            });
            return { ...topic, subtopics: subs };
          });
        const visibleTopics = topics.filter((t) => t.subtopics.length > 0);
        return { ...module, topics: visibleTopics };
      })
      .filter((m) => m.topics.length > 0);
  }, [modules, debouncedQuery, filter, difficulty]);

  const filteredCount = useMemo(
    () => filteredModules.reduce((s, m) => s + m.topics.reduce((x, t) => x + t.subtopics.length, 0), 0),
    [filteredModules]
  );

  const handleStatus = async (st, status) => {
    try {
      await updateStatus(st._id, status);
      toast.success(`${st.title} → ${status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const [bulkBusy, setBulkBusy] = useState(null);

  const handleBulk = async (entity, item) => {
    const checkOff = item.progress < 100;
    setBulkBusy(item._id);
    try {
      await bulkUpdateStatus(entity, item._id, checkOff ? 'completed' : 'not_started');
      toast.success(`${item.title} ${checkOff ? 'marked completed' : 'reset'}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkBusy(null);
    }
  };

  const handleAddTopic = async (form) => {
    try {
      await mutateSyllabus(() => API.post('/topics', form).then((r) => r.data));
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw new Error(message);
    }
  };

  const handleAddSub = (topicId) => async (form) => {
    try {
      await mutateSyllabus(() => API.post('/subtopics', { topicId, ...form }).then((r) => r.data));
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw new Error(message);
    }
  };

  const handleAddModule = async (form) => {
    try {
      await mutateSyllabus(() => API.post('/modules', form).then((r) => r.data));
      toast.success('Module added');
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw new Error(message);
    }
  };

  const handleEditModule = async (form) => {
    try {
      await mutateSyllabus(() => API.put(`/modules/${editModule._id}`, form).then((r) => r.data));
      toast.success('Module updated');
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw new Error(message);
    }
  };

  const handleEditTopic = async (form) => {
    try {
      await mutateSyllabus(() => API.put(`/topics/${editTopic._id}`, form).then((r) => r.data));
      toast.success('Topic updated');
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw new Error(message);
    }
  };

  const handleEditSub = async (form) => {
    try {
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        estimatedTime: form.estimatedTime,
        resources: (form.resources || []).filter((r) => r.title && r.url),
      };
      await mutateSyllabus(() => API.put(`/subtopics/${editSub._id}`, payload).then((r) => r.data));
      toast.success('Subtopic updated');
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      throw new Error(message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await mutateSyllabus(() => API.delete(deleteTarget.endpoint).then((r) => r.data));
      toast.success(deleteTarget.label);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const requestDelete = (type, item) => {
    const label = `${type === 'module' ? 'Module' : type === 'topic' ? 'Topic' : 'Subtopic'} deleted`;
    setDeleteTarget({
      endpoint: `/${type}s/${item._id}`,
      label,
      title: `Delete ${item.title}?`,
      message:
        type === 'module'
          ? 'This will remove the module along with all of its topics and subtopics.'
          : type === 'topic'
          ? 'This will remove the topic and all of its subtopics.'
          : 'This will remove the subtopic and its progress. This cannot be undone.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm">Loading syllabus...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Syllabus</h1>
          <p className="mt-1 text-sm text-slate-500">
            The full MERN curriculum. Tap a status chip to advance a subtopic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddModuleOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50"
          >
            <Plus className="h-4 w-4" /> Add Module
          </button>
          <button
            type="button"
            onClick={() => setAddTopicFor('')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Add Topic
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, subtopics, modules..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === f.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:border-brand-400 focus:outline-none"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall progress strip */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Overall Progress</span>
          <span className="font-bold text-brand-600">{totals?.overallProgress ?? 0}%</span>
        </div>
        <ProgressBar value={totals?.overallProgress ?? 0} size="lg" />
        <p className="mt-2 text-xs text-slate-400">
          {totals?.completed ?? 0} of {totals?.total ?? 0} subtopics completed
          {filteredCount <= (totals?.total ?? 0) && filteredCount !== (totals?.total ?? 0)
            ? ` · showing ${filteredCount}`
            : ''}
        </p>
      </div>

      {/* Tree */}
      <div className="space-y-4">
        {!filteredModules.length ? (
          <EmptyNotice />
        ) : (
          filteredModules.map((module, mi) => (
            <ModuleBlock
              key={module._id}
              module={module}
              isOpen={expandedModules.has(module._id)}
              onToggle={() => toggleModule(module._id)}
              onAddTopic={() => setAddTopicFor(module._id)}
              onAddSub={(topicId) => setAddSubFor(topicId)}
              onStatus={handleStatus}
              onBulk={(entity, item) => handleBulk(entity, item)}
              bulkBusy={bulkBusy}
              onEditModule={() => setEditModule(module)}
              onDeleteModule={() => requestDelete('module', module)}
              onEditTopic={(topic) => setEditTopic(topic)}
              onDeleteTopic={(topic) => requestDelete('topic', topic)}
              onEditSub={(st) => setEditSub(st)}
              onDeleteSub={(st) => requestDelete('subtopic', st)}
              index={mi}
              defaultOpen={filteredModules.length === 1}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AddModuleModal
        open={addModuleOpen}
        onClose={() => setAddModuleOpen(false)}
        onAdd={handleAddModule}
      />
      <AddTopicModal
        open={addTopicFor !== null}
        onClose={() => setAddTopicFor(null)}
        modules={modules}
        defaultModuleId={addTopicFor && addTopicFor !== '' ? addTopicFor : ''}
        onAdd={handleAddTopic}
      />
      <AddSubTopicModal
        open={addSubFor !== null}
        onClose={() => setAddSubFor(null)}
        onAdd={addSubFor ? handleAddSub(addSubFor) : () => Promise.resolve()}
      />
      <EditModuleModal
        open={editModule !== null}
        onClose={() => setEditModule(null)}
        module={editModule}
        onSave={handleEditModule}
      />
      <EditTopicModal
        open={editTopic !== null}
        onClose={() => setEditTopic(null)}
        topic={editTopic}
        onSave={handleEditTopic}
      />
      <EditSubTopicModal
        open={editSub !== null}
        onClose={() => setEditSub(null)}
        subtopic={editSub}
        onSave={handleEditSub}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.title}
        message={deleteTarget?.message}
        loading={deleting}
      />
    </div>
  );
};

const EmptyNotice = () => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
    <Search className="h-8 w-8 text-slate-300" />
    <h3 className="text-lg font-semibold text-slate-700">No matches</h3>
    <p className="max-w-sm text-sm text-slate-500">Try a different search term or clear your filters.</p>
  </div>
);

const ModuleBlock = ({
  module,
  isOpen,
  onToggle,
  onAddTopic,
  onAddSub,
  onStatus,
  onBulk,
  bulkBusy,
  onEditModule,
  onDeleteModule,
  onEditTopic,
  onDeleteTopic,
  onEditSub,
  onDeleteSub,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.03 }}
    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50/70"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <FolderOpen className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-slate-800">{module.title}</p>
          {module.isCustom ? <CustomBadge /> : null}
        </div>
        <p className="text-xs text-slate-400">
          {module.completed}/{module.total} subtopics
        </p>
      </div>
      <div className="hidden w-28 shrink-0 sm:block">
        <div className="mb-1 flex justify-between text-[11px] text-slate-400">
          <span>progress</span>
          <span className="font-semibold text-slate-600">{module.progress}%</span>
        </div>
        <ProgressBar value={module.progress} size="sm" />
      </div>
      <CheckTopicButton
        checked={module.total > 0 && module.progress === 100}
        partiallyChecked={module.progress > 0 && module.progress < 100}
        busy={bulkBusy === module._id}
        onClick={(e) => {
          e.stopPropagation();
          onBulk('module', module);
        }}
      />
      <ActionMenu
        onEdit={onEditModule}
        onDelete={onDeleteModule}
        showDelete={module.isCustom}
      />
      {isOpen ? (
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
      )}
    </button>

    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5">
            {module.topics.length ? (
              module.topics.map((topic, ti) => (
                <TopicBlock
                  key={topic._id}
                  topic={topic}
                  moduleTitle={module.title}
                  onAddSub={() => onAddSub(topic._id)}
                  onStatus={onStatus}
                  onBulk={onBulk}
                  bulkBusy={bulkBusy}
                  onEditTopic={() => onEditTopic(topic)}
                  onDeleteTopic={() => onDeleteTopic(topic)}
                  onEditSub={onEditSub}
                  onDeleteSub={onDeleteSub}
                  index={ti}
                />
              ))
            ) : (
              <p className="py-2 text-center text-sm text-slate-400">
                No topics in this module yet.{' '}
                <button type="button" onClick={onAddTopic} className="font-semibold text-brand-600 hover:text-brand-700">
                  Add the first topic
                </button>
              </p>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </motion.div>
);

const TopicBlock = ({ topic, onAddSub, onStatus, onBulk, bulkBusy, onEditTopic, onDeleteTopic, onEditSub, onDeleteSub }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <List className="h-4 w-4 shrink-0 text-brand-400" />
          <p className="truncate text-sm font-semibold text-slate-700">{topic.title}</p>
          {topic.isCustom ? <CustomBadge /> : null}
        </button>
        <div className="hidden w-40 shrink-0 items-center gap-2 sm:flex">
          <div className="flex-1">
            <ProgressBar value={topic.progress} size="sm" />
          </div>
          <span className="text-[11px] text-slate-400">
            {topic.completed}/{topic.total}
          </span>
        </div>
        <CheckTopicButton
          checked={topic.total > 0 && topic.progress === 100}
          partiallyChecked={topic.progress > 0 && topic.progress < 100}
          busy={bulkBusy === topic._id}
          onClick={(e) => {
            e.stopPropagation();
            onBulk('topic', topic);
          }}
        />
        <ActionMenu
          onEdit={onEditTopic}
          onDelete={onDeleteTopic}
          showDelete={topic.isCustom}
        />
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="subs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 border-t border-slate-50 px-3 py-2 pl-10">
              {topic.subtopics.map((st) => (
                <SubTopicRow
                  key={st._id}
                  st={st}
                  onStatus={onStatus}
                  onEditSub={onEditSub}
                  onDeleteSub={onDeleteSub}
                />
              ))}
              <button
                type="button"
                onClick={onAddSub}
                className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Subtopic
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const SubTopicRow = ({ st, onStatus, onEditSub, onDeleteSub }) => (
  <div className="flex items-center gap-2 rounded-lg py-1 transition hover:bg-slate-50">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className={statusDot(st.status)} />
      <span className={`truncate text-sm ${st.isCustom ? 'italic text-slate-500' : 'text-slate-700'}`}>
        {st.title}
      </span>
      {st.isCustom ? <CustomBadge /> : null}
      {st.difficulty ? (
        <span className="hidden text-[10px] font-medium uppercase tracking-wide text-slate-400 md:inline">
          {st.difficulty}
        </span>
      ) : null}
    </div>
    {st.isCustom ? (
      <ActionMenu onEdit={() => onEditSub(st)} onDelete={() => onDeleteSub(st)} align="left" />
    ) : null}
    <StepStatusButton status={st.status} onClick={() => onStatus(st, nextStatus(st.status))} />
  </div>
);

const statusDot = (status) =>
  status === 'completed'
    ? 'h-2 w-2 shrink-0 rounded-full bg-emerald-500'
    : status === 'in_progress'
    ? 'h-2 w-2 shrink-0 rounded-full bg-amber-400'
    : 'h-2 w-2 shrink-0 rounded-full border border-slate-300 bg-white';

const CustomBadge = () => (
  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">
    <Star className="h-2.5 w-2.5" /> Custom
  </span>
);