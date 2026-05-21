// src/app/auth/signup/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { signUp } from '@/lib/authService';
import { validateUsername, isUsernameAvailable } from '@/lib/authService';
import { validatePassword } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameTimer, setUsernameTimer] = useState<NodeJS.Timeout | null>(null);

  const passwordInfo = validatePassword(form.password);

  const handleUsernameChange = (value: string) => {
    setForm((f) => ({ ...f, username: value }));
    if (usernameTimer) clearTimeout(usernameTimer);
    if (!value) { setUsernameStatus('idle'); return; }

    const error = validateUsername(value);
    if (error) { setUsernameStatus('invalid'); return; }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const available = await isUsernameAvailable(value);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 600);
    setUsernameTimer(timer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== 'available') { toast.error('Please choose a valid unique username'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!passwordInfo.valid) { toast.error('Password is too weak'); return; }

    setLoading(true);
    try {
      await signUp(form.email, form.password, form.username);
      toast.success('Account created! Please verify your email.');
      router.push('/feed');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="card p-8 border-[var(--border-2)]">
        <h1 className="font-display font-bold text-2xl mb-1">Create your account</h1>
        <p className="text-sm text-[#a09cc0] mb-6">Join the anonymous student community</p>

        {/* Privacy warning */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/8 border border-orange-500/20 mb-6">
          <AlertTriangle size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-orange-300 leading-relaxed">
            <strong>Do not use your real name</strong> for privacy and security purposes. Choose a creative anonymous username.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Username</label>
            <div className="relative">
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="e.g. phantom_coder_99"
                className="input pr-8"
                required
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'available' && <CheckCircle2 size={15} className="text-emerald-400" />}
                {usernameStatus === 'taken' && <XCircle size={15} className="text-red-400" />}
                {usernameStatus === 'checking' && <div className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />}
              </div>
            </div>
            <p className={`text-[11px] mt-1 ${
              usernameStatus === 'available' ? 'text-emerald-400' :
              usernameStatus === 'taken' ? 'text-red-400' :
              usernameStatus === 'invalid' ? 'text-orange-400' : 'text-[#5a5680]'
            }`}>
              {usernameStatus === 'available' ? '✓ Username is available' :
               usernameStatus === 'taken' ? '✗ Username already taken' :
               usernameStatus === 'invalid' ? '✗ 3–20 chars, letters/numbers/underscores only' :
               '3–20 characters, letters, numbers, underscores only'}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">College Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@college.edu"
              className="input"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Create a strong password"
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5680] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < passwordInfo.strength ? strengthColors[passwordInfo.strength - 1] : 'bg-surface-3'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#5a5680]">{passwordInfo.message}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Confirm your password"
              className="input"
              required
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || usernameStatus !== 'available'}
            className="btn-primary w-full py-3 justify-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
            ) : (
              'Create Anonymous Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#5a5680] mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
}
