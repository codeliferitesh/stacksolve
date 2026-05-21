// src/app/auth/forgot-password/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '@/lib/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="card p-8 border-[var(--border-2)]">
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl mb-2">Check your email</h2>
            <p className="text-sm text-[#a09cc0] mb-6">
              We sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            <Link href="/auth/login" className="btn-primary px-6 py-2.5 inline-flex items-center gap-2">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <Link href="/auth/login" className="flex items-center gap-2 text-sm text-[#a09cc0] hover:text-white mb-6 transition-colors">
              <ArrowLeft size={14} /> Back to login
            </Link>
            <h1 className="font-display font-bold text-2xl mb-1">Reset password</h1>
            <p className="text-sm text-[#a09cc0] mb-6">Enter your email and we'll send a reset link</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5680]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="input pl-9"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 justify-center flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
