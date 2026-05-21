'use client';
import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createPost } from '@/lib/postService';

interface Props {
  authorId: string;
  authorUsername: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = ['DSA', 'WebDev', 'Exams', 'Mental Health', 'Internship', 'Career', 'Assignments', 'General'];

export default function CreatePostModal({ authorId, authorUsername, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ title: '', body: '', tagsInput: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.body.trim()) { toast.error('Description is required'); return; }

    const tags = form.tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, '').replace(/\s+/g, ''))
      .filter(Boolean)
      .slice(0, 5);

    setLoading(true);
    try {
      await createPost(authorId, authorUsername, form.title, form.body, tags);
      toast.success('Post published anonymously 🚀');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    const current = form.tagsInput ? form.tagsInput.split(',').map((t) => t.trim()) : [];
    if (!current.includes(tag) && current.length < 5) {
      setForm((f) => ({ ...f, tagsInput: [...current, tag].join(', ') }));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface-1 border border-[var(--border-2)] rounded-2xl p-6 w-full max-w-lg"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-lg">Share with the community</h2>
              <p className="text-xs text-[#5a5680] mt-0.5">Posting as @{authorUsername}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-2 text-[#5a5680] hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-600/8 border border-brand-600/20 mb-5 text-xs text-brand-300">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
            Your username is shown, not your real identity. Stay anonymous.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="What's your question or topic?"
                className="input"
                maxLength={200}
                required
              />
              <div className="text-right text-[11px] text-[#5a5680] mt-1">{form.title.length}/200</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Description *</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Describe in detail. More context = better help from the community."
                className="input resize-none h-28"
                maxLength={2000}
                required
              />
              <div className="text-right text-[11px] text-[#5a5680] mt-1">{form.body.length}/2000</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Tags (up to 5, comma separated)</label>
              <input
                value={form.tagsInput}
                onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.target.value }))}
                placeholder="DSA, Python, WebDev..."
                className="input"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => addTag(cat)}
                    className="tag-purple text-[11px] cursor-pointer hover:bg-brand-600/20 transition-colors"
                  >
                    +{cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing...</> : 'Post Anonymously'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
