import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Spinner } from '../components/Loading.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { CheckTopicButton } from '../components/ProgressCard.jsx';
import { subjectLabel } from '../components/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Syllabus = () => {
  const { user } = useAuth();
  const toast = useToast();
  const {
    syllabus,
    loading,
    error,
    updateTopicStatus,
    toggleSectionTopics,
    createSection,
    createTopic,
    updateTopic,
    deleteTopic,
    deleteSection,
  } = useData();

  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addTopicFor, setAddTopicFor] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sections = syllabus?.sections || [];
  const totals = syllabus?.totals;
  const subject = subjectLabel(user?.subject);

  if (loading && !syllabus) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm">Loading your syllabus...</span>
        </div>
      </div>
    );
  }

  if (error || !syllabus) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-card">
        <p className="text-sm text-slate-500">{error || 'Syllabus not found for your subject.'}</p>
      </div>
    );
  }

  const handleToggle = async (topic) => {
    try {
      await updateTopicStatus(topic._id, !topic.completed);
      toast.success(topic.completed ? `${topic.title} reopened` : `${topic.title} marked completed`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSectionTick = async (section) => {
    const targets = (section.topics || []).filter((t) => !t.optional);
    if (!targets.length) return;
    const allDone = targets.every((t) => t.completed);
    try {
      await toggleSectionTopics(section._id, !allDone);
      toast.success(allDone ? `${section.title} reopened` : `${section.title} marked completed`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddSection = async (form) => {
    try {
      await createSection(form);
      toast.success('Section added');
      setAddSectionOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddTopic = async (form) => {
    try {
      await createTopic({ sectionId: addTopicFor, ...form });
      toast.success('Topic added');
      setAddTopicFor(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = async (form) => {
    if (!editTarget) return;
    try {
      await updateTopic(editTarget._id, form);
      toast.success('Updated');
      setEditTarget(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'section') {
        await deleteSection(deleteTarget._id);
      } else {
        await deleteTopic(deleteTarget._id);
      }
      toast.success('Deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{subject} Syllabus</h1>
        <p className="mt-1 text-sm text-slate-500">
          {totals?.topicsCompleted}/{totals?.topicsTotal} topics done · {totals?.overallProgress ?? 0}%
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProgressBar value={totals?.overallProgress ?? 0} className="w-full max-w-xs" showLabel />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddSectionOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Section
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {!sections.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">Nothing here yet</p>
            <p className="mt-1 text-xs text-slate-400">Add a section to start building your syllabus.</p>
          </div>
        ) : (
          sections.map((section, si) => (
            <SectionBlock
              key={section._id}
              section={section}
              index={si}
              onAddTopic={() => setAddTopicFor(section._id)}
              onToggle={handleToggle}
              onSectionTick={handleSectionTick}
              onEdit={(item) => setEditTarget(item)}
              onDeleteSection={(section) =>
                setDeleteTarget({
                  _id: section._id,
                  title: section.title,
                  type: 'section',
                  message: 'This will remove the section and all its topics, along with any notes, questions and problems you added.',
                })
              }
              onDelete={(item) =>
                setDeleteTarget({
                  ...item,
                  _id: item._id,
                  type: 'topic',
                  message: 'This will remove this topic from your syllabus, along with any notes, questions and problems you added to it.',
                })
              }
            />
          ))
        )}
      </div>

      {/* Add Section */}
      <ContentModal
        open={addSectionOpen}
        onClose={() => setAddSectionOpen(false)}
        title="Add Section"
        fields={[{ key: 'title', label: 'Section title' }, { key: 'description', label: 'Description', textarea: true }]}
        initial={{}}
        onSubmit={handleAddSection}
      />

      {/* Add Topic */}
      <ContentModal
        open={addTopicFor !== null}
        onClose={() => setAddTopicFor(null)}
        title="Add Topic"
        fields={[{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', textarea: true }]}
        initial={{}}
        onSubmit={(form) => handleAddTopic({ ...form, sectionId: addTopicFor })}
      />

      {/* Edit Topic */}
      <ContentModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        title="Edit Topic"
        fields={[{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', textarea: true }]}
        initial={
          editTarget
            ? { title: editTarget.title, description: editTarget.description || '' }
            : {}
        }
        onSubmit={handleEdit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        message={deleteTarget?.message}
        loading={deleting}
        confirmLabel={deleteTarget?.type === 'section' ? 'Delete Section' : 'Delete Topic'}
      />
    </div>
  );
};

const SectionBlock = ({ section, index, onAddTopic, onToggle, onSectionTick, onEdit, onDelete, onDeleteSection }) => {
  const [open, setOpen] = useState(false);

  const tickTargets = (section.topics || []).filter((t) => !t.optional);
  const allDone = tickTargets.length > 0 && tickTargets.every((t) => t.completed);
  const someDone = tickTargets.some((t) => t.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {open ? <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" /> : <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold text-slate-800">{section.title}</p>
              {section.createdBy ? (
                <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                  Custom
                </span>
              ) : null}
              {section.optional ? (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Optional
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400">
              {section.completed}/{section.total} topics
            </p>
          </div>
        </button>
        <div className="hidden w-28 shrink-0 sm:block">
          <ProgressBar value={section.progress} size="sm" />
        </div>
        {tickTargets.length ? (
          <CheckTopicButton
            checked={allDone}
            partiallyChecked={someDone && !allDone}
            onClick={() => onSectionTick(section)}
          />
        ) : null}
        {section.createdBy ? (
          <button
            type="button"
            onClick={() => onDeleteSection(section)}
            className="inline-flex shrink-0 items-center rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            aria-label={`Delete section ${section.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onAddTopic}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          <Plus className="h-3.5 w-3.5" /> Topic
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
              {section.topics.length ? (
                section.topics.map((topic, ti) => (
                  <TopicRow
                    key={topic._id}
                    topic={topic}
                    index={ti}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <p className="py-2 text-center text-sm text-slate-400">
                  No topics in this section yet. Add the first one to get started.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

const TopicRow = ({ topic, index, onToggle, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: index * 0.02 }}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
    >
      <ToggleButton checked={topic.completed} onClick={() => onToggle(topic)} />
      <Link to={`/topics/${topic._id}`} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className={`truncate text-sm ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
          {topic.title}
        </span>
        {topic.isCustom ? (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-brand-500">Custom</span>
        ) : null}
        {topic.optional ? (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Optional</span>
        ) : null}
      </Link>
      <div className="hidden w-20 shrink-0 items-center gap-2 sm:flex">
        <ProgressBar value={topic.completed ? 100 : 0} size="sm" />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(topic)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
            type="button"
            onClick={() => onDelete(topic)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
            aria-label={`Delete topic ${topic.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
    </motion.div>
  );
};

const ToggleButton = ({ checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={checked ? 'Mark as not completed' : 'Mark as completed'}
    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
      checked
        ? 'border-emerald-500 bg-emerald-500 text-white'
        : 'border-slate-300 bg-white text-transparent hover:border-emerald-400'
    }`}
  >
    <Check className="h-3 w-3" strokeWidth={3.5} />
  </button>
);

const ContentModal = ({ open, onClose, title, fields, initial = {}, onSubmit }) => {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.title?.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ ...form, title: form.title.trim() });
    } catch {
      // handled upstream
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</label>
            {f.textarea ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => set(f.key)(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            ) : (
              <input
                value={form[f.key] || ''}
                onChange={(e) => set(f.key)(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !form.title?.trim()}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};