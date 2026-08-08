import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const AddModuleModal = ({ open, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setSubmitError('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!title.trim()) return setSubmitError('Module name is required');

    setSubmitting(true);
    try {
      await onAdd({ title: title.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Unable to add module. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Module">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="add-module-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Module Name
          </label>
          <input
            id="add-module-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Tailwind CSS"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label htmlFor="add-module-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="add-module-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            {submitting ? 'Adding...' : 'Add Module'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddModuleModal;