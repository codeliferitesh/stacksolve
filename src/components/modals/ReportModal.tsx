'use client';
import { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { submitReport } from '@/lib/reportService';
import { REPORT_REASONS } from '@/lib/utils';

interface Props {
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  onClose: () => void;
}

export default function ReportModal({ reporterId, targetType, targetId, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { toast.error('Please select a reason'); return; }
    setLoading(true);
    try {
      await submitReport(reporterId, targetType, targetId, reason, description);
      toast.success('Report submitted. Thank you!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface-1 border border-[var(--border-2)] rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flag size={16} className="text-red-400" />
              <h2 className="font-display font-bold text-lg">Report Content</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-2 text-[#5a5680] hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-2">Reason *</label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--border-2)] cursor-pointer transition-colors">
                    <input type="radio" name="reason" value={r} onChange={() => setReason(r)} className="accent-brand-600" />
                    <span className="text-[13.5px]">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Additional details (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context..."
                className="input resize-none h-20"
                maxLength={500}
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={loading || !reason} className="flex-1 py-2.5 text-sm bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : null}
                Submit Report
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
