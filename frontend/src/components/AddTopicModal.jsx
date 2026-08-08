import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const AddTopicModal = ({ open, onClose, modules, onAdd, defaultModuleId = '' }) => {
  const [form, setForm] = useState({
    moduleId: defaultModuleId || modules?.[0]?._id || '',
    title: '',
    description: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        moduleId: defaultModuleId || modules?.[0]?._id || '',
        title: '',
        description: '',
      });
      setSubmitError('');
    }
  }, [open, defaultModuleId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.moduleId) return setSubmitError('Please select a module');
    if (!form.title.trim()) return setSubmitError('Topic name is required');

    setSubmitting(true);
    try {
      await onAdd(form);
      setForm({ moduleId: form.moduleId, title: '', description: '' });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Unable to add topic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Topic">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="add-topic-module" className="mb-1.5 block text-sm font-medium text-slate-700">
            Module
          </label>
          <select
            id="add-topic-module"
            name="moduleId"
            value={form.moduleId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {modules.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="add-topic-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Topic Name
          </label>
          <input
            id="add-topic-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Generator Functions"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label htmlFor="add-topic-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="add-topic-desc"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Optional short description"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
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
            {submitting ? 'Adding...' : 'Add Topic'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTopicModal;