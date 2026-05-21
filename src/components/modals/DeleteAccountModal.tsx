'use client';
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteAccount } from '@/lib/authService';
import { useAuthStore } from '@/store/authStore';

interface Props { onClose: () => void; }

export default function DeleteAccountModal({ onClose }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setLoading(true);
    try {
      await deleteAccount(password);
      logout();
      toast.success('Account permanently deleted');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface-1 border border-red-500/30 rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              <h2 className="font-display font-bold text-lg text-red-400">Delete Account</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-2 text-[#5a5680] hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <p className="text-sm text-[#a09cc0] mb-5 leading-relaxed">
            This will <strong className="text-white">permanently delete</strong> your account, all your posts, comments, and data. This action <strong className="text-red-400">cannot be undone</strong>.
          </p>
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Current Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Confirm your password" className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Type <strong className="text-red-400">DELETE</strong> to confirm</label>
              <input type="text" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" className="input" required />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={loading || confirm !== 'DELETE'} className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Delete Forever
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
