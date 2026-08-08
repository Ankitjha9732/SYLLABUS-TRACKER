import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Save, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { Spinner, EmptyState } from '../components/Loading.jsx';
import API, { getErrorMessage } from '../services/api.js';
import { formatDate } from '../utils/index.js';

export const Notes = () => {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/progress');
      setItems(data.items || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateDraft = (id, value) => setDrafts((d) => ({ ...d, [id]: value }));

  const save = async (item) => {
    if (!item?.subtopic?.id) return;
    setSaving((s) => ({ ...s, [item.subtopic.id]: true }));
    try {
      const notes = drafts[item.subtopic.id] !== undefined ? drafts[item.subtopic.id] : item.notes || '';
      await API.post(`/progress/${item.subtopic.id}/notes`, { notes });
      setItems((prev) => prev.map((p) => (p._id === item._id ? { ...p, notes } : p)));
      toast.success('Note saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving((s) => ({ ...s, [item.subtopic.id]: false }));
    }
  };

  const remove = async (item) => {
    if (!item?.subtopic?.id) return;
    setSaving((s) => ({ ...s, [item.subtopic.id]: true }));
    try {
      await API.post(`/progress/${item.subtopic.id}/notes`, { notes: '' });
      setItems((prev) => prev.map((p) => (p._id === item._id ? { ...p, notes: '' } : p)));
      toast.success('Note cleared');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving((s) => ({ ...s, [item.subtopic.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Spinner />
          <span className="text-sm">Loading your notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Notes</h1>
        <p className="mt-1 text-sm text-slate-500">Personal notes attached to each subtopic — private to you.</p>
      </motion.div>

      {!items?.length ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          message="Open any subtopic from the syllabus and add a note there."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const value = drafts[item.subtopic?.id] !== undefined ? drafts[item.subtopic?.id] : item.notes || '';
            const dirty = value !== (item.notes || '');
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
              >
                <div className="mb-3">
                  <p className="text-sm font-bold text-slate-800">{item.subtopic?.title || 'Subtopic'}</p>
                  <p className="text-xs text-slate-400">
                    {item.module?.title} · {item.topic?.title}
                  </p>
                  {item.updatedAt ? (
                    <p className="mt-1 text-[11px] text-slate-300">Updated {formatDate(item.updatedAt)}</p>
                  ) : null}
                </div>
                <textarea
                  value={value}
                  onChange={(e) => item.subtopic?.id && updateDraft(item.subtopic.id, e.target.value)}
                  rows={4}
                  placeholder="Write your note here..."
                  className="w-full flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => save(item)}
                      disabled={saving[item.subtopic?.id] || !dirty}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving[item.subtopic?.id] ? 'Saving...' : 'Save'}
                    </button>
                    {dirty ? (
                      <button
                        type="button"
                        onClick={() => item.subtopic?.id && updateDraft(item.subtopic.id, item.notes || '')}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600"
                      >
                        Reset
                      </button>
                    ) : null}
                  </div>
                  {item.subtopic?.id ? (
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      title="Clear note"
                      className="rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};