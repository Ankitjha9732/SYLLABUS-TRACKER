import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const EditModuleModal = ({ open, onClose, module, onSave }) => {
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && module) {
      setForm({ title: module.title || '', description: module.description || '' });
      setSubmitError('');
    }
  }, [open, module]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!form.title.trim()) return setSubmitError('Module name is required');

    setSubmitting(true);
    try {
      await onSave({ title: form.title.trim(), description: form.description.trim() });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Unable to update module. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Module">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-module-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Module Name
          </label>
          <input
            id="edit-module-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label htmlFor="edit-module-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="edit-module-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
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
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModuleModal;