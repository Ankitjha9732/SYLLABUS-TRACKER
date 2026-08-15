import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  ExternalLink,
  FileText,
  HelpCircle,
  Code2,
  ListChecks,
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Spinner } from '../components/Loading.jsx';
import { DIFFICULTY_META } from '../utils/index.js';

const Checkbox = ({ checked, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
      checked
        ? 'border-emerald-500 bg-emerald-500 text-white'
        : 'border-slate-300 bg-white text-transparent hover:border-emerald-400'
    }`}
  >
    <Check className="h-3 w-3" strokeWidth={3.5} />
  </button>
);

export const TopicDetail = () => {
  const { topicId } = useParams();
  const toast = useToast();
  const {
    updateTopicStatus,
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
  } = useData();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [noteModal, setNoteModal] = useState(null); // { mode, item }
  const [questionModal, setQuestionModal] = useState(null);
  const [problemModal, setProblemModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTopicDetail(topicId);
      setDetail(data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Topic not found');
    } finally {
      setLoading(false);
    }
  }, [topicId, fetchTopicDetail]);

  useEffect(() => {
    reload();
  }, [reload]);

  const topic = detail?.topic || null;
  const isDSA = topic?.isDSA;

  const notes = detail?.notes || [];
  const questions = detail?.questions || [];
  const problems = detail?.problems || [];

  const questionsDone = useMemo(() => questions.filter((q) => q.completed).length, [questions]);
  const problemsDone = useMemo(() => problems.filter((p) => p.completed).length, [problems]);

  if (loading && !detail) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm">Loading topic...</span>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-card">
        <p className="text-sm text-slate-500">{error || 'Topic not found.'}</p>
        <Link
          to="/syllabus"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to syllabus
        </Link>
      </div>
    );
  }

  const handleToggle = async () => {
    const next = !topic.completed;
    setDetail((d) => ({
      ...d,
      topic: { ...d.topic, completed: next, completedAt: next ? new Date().toISOString() : null },
    }));
    try {
      await updateTopicStatus(topic._id, next);
      toast.success(next ? 'Topic completed' : 'Topic reopened');
    } catch (err) {
      toast.error(err.message);
      await reload();
    }
  };

  const run = async (fn, success) => {
    try {
      await fn();
      await reload();
      toast.success(success);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitNote = async (form) => {
    if (noteModal?.mode === 'edit') {
      await run(() => updateNote(noteModal.item._id, form.content), 'Note updated');
    } else {
      await run(() => createNote(topic._id, form.content), 'Note added');
    }
    setNoteModal(null);
  };

  const submitQuestion = async (form) => {
    if (questionModal?.mode === 'edit') {
      await run(() => updateQuestion(questionModal.item._id, { question: form.question }), 'Question updated');
    } else {
      await run(() => createQuestion(topic._id, form.question), 'Question added');
    }
    setQuestionModal(null);
  };

  const toggleQuestion = async (q) => {
    setDetail((d) => ({
      ...d,
      questions: d.questions.map((x) => (x._id === q._id ? { ...x, completed: !x.completed } : x)),
    }));
    try {
      await updateQuestion(q._id, { completed: !q.completed });
    } catch (err) {
      toast.error(err.message);
      await reload();
    }
  };

  const submitProblem = async (form) => {
    if (problemModal?.mode === 'edit') {
      await run(
        () =>
          updateProblem(problemModal.item._id, {
            title: form.title,
            link: form.link,
            difficulty: form.difficulty,
            note: form.note,
          }),
        'Problem updated'
      );
    } else {
      await run(
        () =>
          createProblem(topic._id, {
            title: form.title,
            link: form.link,
            difficulty: form.difficulty,
            note: form.note,
          }),
        'Problem added'
      );
    }
    setProblemModal(null);
  };

  const toggleProblem = async (p) => {
    setDetail((d) => ({
      ...d,
      problems: d.problems.map((x) => (x._id === p._id ? { ...x, completed: !x.completed } : x)),
    }));
    try {
      await updateProblem(p._id, { completed: !p.completed });
    } catch (err) {
      toast.error(err.message);
      await reload();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { kind, id } = deleteTarget;
      if (kind === 'note') await deleteNote(id);
      else if (kind === 'question') await deleteQuestion(id);
      else await deleteProblem(id);
      toast.success('Deleted');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/syllabus"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Syllabus
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 text-2xl font-bold text-slate-800">{topic.title}</h1>
          {topic.isCustom ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
              Custom
            </span>
          ) : null}
          {topic.optional ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Optional
            </span>
          ) : null}
        </div>
        {topic.description ? <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{topic.description}</p> : null}

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
          <Checkbox checked={topic.completed} onClick={handleToggle} title="Toggle completion" />
          <span className="text-sm font-medium text-slate-700">
            {topic.completed ? 'Completed' : 'Not completed yet'}
          </span>
        </div>
      </div>

      {/* Important Notes */}
      <SectionCard
        icon={FileText}
        title="Important Notes"
        countLabel={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
        accent="text-sky-600 bg-sky-50"
        actionLabel="Add Note"
        onAdd={() => setNoteModal({ mode: 'create' })}
      >
        {notes.length ? (
          <div className="space-y-2">
            {notes.map((n) => (
              <NoteRow
                key={n._id}
                note={n}
                onEdit={() => setNoteModal({ mode: 'edit', item: n })}
                onDelete={() => setDeleteTarget({ kind: 'note', id: n._id })}
              />
            ))}
          </div>
        ) : (
          <Empty hint="Note down key points, gotchas and formulas for this topic." />
        )}
      </SectionCard>

      {/* Important Questions */}
      <SectionCard
        icon={HelpCircle}
        title="Interview Questions"
        countLabel={`${questionsDone}/${questions.length} prepared`}
        accent="text-violet-600 bg-violet-50"
        actionLabel="Add Question"
        onAdd={() => setQuestionModal({ mode: 'create' })}
      >
        {questions.length ? (
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={q._id} className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                <Checkbox
                  checked={q.completed}
                  onClick={() => toggleQuestion(q)}
                  title={q.completed ? 'Mark as not prepared' : 'Mark as prepared'}
                />
                <div className="min-w-0 flex-1">
                  <p className={`break-words text-sm ${q.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    <span className="mr-1.5 font-semibold text-slate-400">{String(i + 1).padStart(2, '0')}.</span>
                    {q.question}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn title="Edit" onClick={() => setQuestionModal({ mode: 'edit', item: q })}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn danger title="Delete" onClick={() => setDeleteTarget({ kind: 'question', id: q._id })}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty hint="List common interview questions to practice for this topic." />
        )}
      </SectionCard>

      {/* DSA Important Problems */}
      {isDSA ? (
        <SectionCard
          icon={Code2}
          title="Important Problems"
          countLabel={`${problemsDone}/${problems.length} solved`}
          accent="text-emerald-600 bg-emerald-50"
          actionLabel="Add Problem"
          onAdd={() => setProblemModal({ mode: 'create', item: { title: '', link: '', difficulty: 'medium', note: '' } })}
        >
          {problems.length ? (
            <div className="space-y-2">
              {problems.map((p) => (
                <div key={p._id} className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <Checkbox
                    checked={p.completed}
                    onClick={() => toggleProblem(p)}
                    title={p.completed ? 'Mark as unsolved' : 'Mark as solved'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`break-words text-sm ${p.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {p.title}
                      </span>
                      {p.link ? (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          Solve <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                      {p.difficulty ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            DIFFICULTY_META[p.difficulty]?.className || 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      ) : null}
                    </div>
                    {p.note ? <p className="mt-1 break-words text-xs text-slate-500">{p.note}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconBtn title="Edit" onClick={() => setProblemModal({ mode: 'edit', item: p })}>
                      <Pencil className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn danger title="Delete" onClick={() => setDeleteTarget({ kind: 'problem', id: p._id })}>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty hint="Add LeetCode / interview problems to solve for this topic." />
          )}
        </SectionCard>
      ) : null}

      {/* Note modal */}
      <ContentModal
        open={noteModal !== null}
        onClose={() => setNoteModal(null)}
        title={noteModal?.mode === 'edit' ? 'Edit Note' : 'Add Note'}
        fields={[{ key: 'content', label: 'Note', textarea: true }]}
        initial={noteModal?.mode === 'edit' ? { content: noteModal.item.content } : { content: '' }}
        onSubmit={submitNote}
        requiredKey="content"
      />

      {/* Question modal */}
      <ContentModal
        open={questionModal !== null}
        onClose={() => setQuestionModal(null)}
        title={questionModal?.mode === 'edit' ? 'Edit Question' : 'Add Question'}
        fields={[{ key: 'question', label: 'Question', textarea: true }]}
        initial={questionModal?.mode === 'edit' ? { question: questionModal.item.question } : { question: '' }}
        onSubmit={submitQuestion}
        requiredKey="question"
      />

      {/* Problem modal */}
      <ContentModal
        open={problemModal !== null}
        onClose={() => setProblemModal(null)}
        title={problemModal?.mode === 'edit' ? 'Edit Problem' : 'Add Problem'}
        fields={[
          { key: 'title', label: 'Title' },
          { key: 'link', label: 'Link' },
          { key: 'difficulty', label: 'Difficulty', select: ['easy', 'medium', 'hard'] },
          { key: 'note', label: 'Note', textarea: true },
        ]}
        initial={
          problemModal?.mode === 'edit'
            ? { title: problemModal.item.title, link: problemModal.item.link || '', difficulty: problemModal.item.difficulty || 'medium', note: problemModal.item.note || '' }
            : { title: '', link: '', difficulty: 'medium', note: '' }
        }
        onSubmit={submitProblem}
        requiredKey="title"
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete this item?"
        message="This cannot be undone."
        loading={deleting}
        confirmLabel="Delete"
      />
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, countLabel, accent, actionLabel, onAdd, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-400">{countLabel}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
      >
        <Plus className="h-3.5 w-3.5" /> {actionLabel}
      </button>
    </div>
    <div className="mt-4">{children}</div>
  </motion.div>
);

const NoteRow = ({ note, onEdit, onDelete }) => (
  <div className="group flex items-start gap-3 rounded-xl border border-slate-100 px-4 py-3">
    <div className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-slate-700">{note.content}</div>
    <div className="flex shrink-0 items-center gap-1">
      <IconBtn title="Edit" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </IconBtn>
      <IconBtn danger title="Delete" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </IconBtn>
    </div>
  </div>
);

const IconBtn = ({ children, onClick, title, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`rounded-lg p-1.5 ${danger ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-500' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
  >
    {children}
  </button>
);

const Empty = ({ hint }) => (
  <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
    <ListChecks className="h-4 w-4" /> {hint}
  </div>
);

const ContentModal = ({ open, onClose, title, fields, initial = {}, onSubmit, requiredKey }) => {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (requiredKey && !String(form[requiredKey] || '').trim()) return;
    setBusy(true);
    try {
      await onSubmit({ ...form });
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
            ) : f.select ? (
              <select
                value={form[f.key] || ''}
                onChange={(e) => set(f.key)(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {f.select.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
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
            disabled={busy || (requiredKey ? !String(form[requiredKey] || '').trim() : false)}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};