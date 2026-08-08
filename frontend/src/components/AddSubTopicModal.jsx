import { useState } from 'react';
import Modal from './Modal.jsx';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const AddSubTopicModal = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    estimatedTime: '',
    resourceTitle: '',
    resourceUrl: '',
    resourceType: 'other',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.title.trim()) return setSubmitError('Subtopic name is required');

    setSubmitting(true);
    try {
      await onAdd(form);
      setForm({ title: '', description: '', difficulty: 'medium', estimatedTime: '', resourceTitle: '', resourceUrl: '', resourceType: 'other' });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Unable to add subtopic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

  return (
    <Modal open={open} onClose={onClose} title="Add Subtopic">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="add-st-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Subtopic Name
          </label>
          <input
            id="add-st-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Generator Functions"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="add-st-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="add-st-desc"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Optional short description"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="add-st-diff" className="mb-1.5 block text-sm font-medium text-slate-700">
              Difficulty
            </label>
            <select id="add-st-diff" name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="add-st-time" className="mb-1.5 block text-sm font-medium text-slate-700">
              Estimated Time
            </label>
            <input
              id="add-st-time"
              name="estimatedTime"
              value={form.estimatedTime}
              onChange={handleChange}
              placeholder="e.g. 1 hour"
              className={inputClass}
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-600">Resource (optional)</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="add-st-rtitle" className="mb-1.5 block text-sm font-medium text-slate-600">
                Resource Title
              </label>
              <input
                id="add-st-rtitle"
                name="resourceTitle"
                value={form.resourceTitle}
                onChange={handleChange}
                placeholder="e.g. MDN Documentation"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="add-st-rurl" className="mb-1.5 block text-sm font-medium text-slate-600">
                Resource URL
              </label>
              <input
                id="add-st-rurl"
                name="resourceUrl"
                value={form.resourceUrl}
                onChange={handleChange}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="add-st-rtype" className="mb-1.5 block text-sm font-medium text-slate-600">
                Type
              </label>
              <select id="add-st-rtype" name="resourceType" value={form.resourceType} onChange={handleChange} className={inputClass}>
                <option value="video">Video</option>
                <option value="documentation">Documentation</option>
                <option value="article">Article</option>
                <option value="github">GitHub</option>
                <option value="other">Other</option>
              </select>
            </div>
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
            {submitting ? 'Adding...' : 'Add Subtopic'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSubTopicModal;