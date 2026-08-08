import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const EditSubTopicModal = ({ open, onClose, subtopic, onSave }) => {
  const [form, setForm] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && subtopic) {
      setForm({
        title: subtopic.title || '',
        description: subtopic.description || '',
        difficulty: subtopic.difficulty || 'medium',
        estimatedTime: subtopic.estimatedTime || '',
        resources: Array.isArray(subtopic.resources) ? subtopic.resources : [],
      });
      setSubmitError('');
    }
  }, [open, subtopic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.title.trim()) return setSubmitError('Subtopic name is required');

    setSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Unable to update subtopic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

  return (
    <Modal open={open} onClose={onClose} title="Edit Subtopic">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-st-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Subtopic Name
          </label>
          <input
            id="edit-st-title"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="edit-st-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="edit-st-desc"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-st-diff" className="mb-1.5 block text-sm font-medium text-slate-700">
              Difficulty
            </label>
            <select
              id="edit-st-diff"
              value={form.difficulty || 'medium'}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className={inputClass}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-st-time" className="mb-1.5 block text-sm font-medium text-slate-700">
              Estimated Time
            </label>
            <input
              id="edit-st-time"
              value={form.estimatedTime || ''}
              onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
              placeholder="e.g. 1 hour"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Resources</label>
          <div className="space-y-2">
            {(form.resources || []).map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={r.title || ''}
                  onChange={(e) => updateResource(form, setForm, i, { title: e.target.value })}
                  placeholder="Title"
                  className={`${inputClass} flex-1`}
                />
                <input
                  value={r.url || ''}
                  onChange={(e) => updateResource(form, setForm, i, { url: e.target.value })}
                  placeholder="URL"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeResource(form, setForm, i)}
                  className="rounded-lg px-2 py-2 text-sm text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Remove resource"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addResource(form, setForm)}
              className="text-xs font-semibold text-brand-600 transition hover:text-brand-700"
            >
              + Add resource
            </button>
          </div>
        </div>

        {submitError ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{submitError}</p>
        ) : null}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const addResource = (form, setForm) =>
  setForm({ ...form, resources: [...(form.resources || []), { title: '', url: '', type: 'other' }] });

const removeResource = (form, setForm, index) =>
  setForm({ ...form, resources: (form.resources || []).filter((_, i) => i !== index) });

const updateResource = (form, setForm, index, patch) =>
  setForm({
    ...form,
    resources: (form.resources || []).map((r, i) => (i === index ? { ...r, ...patch } : r)),
  });

export default EditSubTopicModal;