'use client';
import { useState } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserPassword, updateUserEmail } from '@/lib/authService';
import { useAuthStore } from '@/store/authStore';
import DeleteAccountModal from '@/components/modals/DeleteAccountModal';
import { validatePassword } from '@/lib/utils';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Email form
  const [emailForm, setEmailForm] = useState({ current: '', newEmail: '' });
  const [emailLoading, setEmailLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) { toast.error('New passwords do not match'); return; }
    const check = validatePassword(pwForm.new);
    if (!check.valid) { toast.error('New password is too weak'); return; }
    setPwLoading(true);
    try {
      await updateUserPassword(pwForm.current, pwForm.new);
      setPwForm({ current: '', new: '', confirm: '' });
      toast.success('Password updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      await updateUserEmail(emailForm.current, emailForm.newEmail);
      if (user) setUser({ ...user, email: emailForm.newEmail });
      setEmailForm({ current: '', newEmail: '' });
      toast.success('Email updated! Please verify your new email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  if (!user) return null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-5 mb-4">
      <h2 className="font-display font-semibold text-sm mb-4 pb-3 border-b border-[var(--border)]">{title}</h2>
      {children}
    </div>
  );

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5">
        <h1 className="font-display font-bold text-base">Settings</h1>
      </div>

      <div className="max-w-xl mx-auto px-6 py-6">
        {/* Account info */}
        <Section title="Account Information">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">Username</div>
                <div className="text-xs text-[#5a5680] mt-0.5">@{user.username}</div>
              </div>
              <span className="text-xs text-[#5a5680] bg-surface-2 px-2.5 py-1 rounded-lg">Cannot change</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-xs text-[#5a5680] mt-0.5">{user.email}</div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-lg ${user.isEmailVerified ? 'bg-emerald-400/10 text-emerald-400' : 'bg-orange-400/10 text-orange-400'}`}>
                {user.isEmailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </Section>

        {/* Change password */}
        <Section title="Change Password">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            {(['current', 'new', 'confirm'] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-[#a09cc0] mb-1.5 capitalize">
                  {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPw[field as 'current' | 'new'] ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="input pr-10"
                    required
                  />
                  {field !== 'confirm' && (
                    <button type="button" onClick={() => setShowPw((s) => ({ ...s, [field]: !s[field as 'current' | 'new'] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5680] hover:text-white">
                      {showPw[field as 'current' | 'new'] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwLoading} className="btn-primary text-sm py-2.5 w-full justify-center flex items-center gap-2 disabled:opacity-50 mt-1">
              {pwLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : 'Update Password'}
            </button>
          </form>
        </Section>

        {/* Change email */}
        <Section title="Change Email">
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">Current Password</label>
              <input type="password" value={emailForm.current} onChange={(e) => setEmailForm((f) => ({ ...f, current: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a09cc0] mb-1.5">New Email Address</label>
              <input type="email" value={emailForm.newEmail} onChange={(e) => setEmailForm((f) => ({ ...f, newEmail: e.target.value }))} className="input" required />
            </div>
            <button type="submit" disabled={emailLoading} className="btn-primary text-sm py-2.5 w-full justify-center flex items-center gap-2 disabled:opacity-50">
              {emailLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : 'Update Email'}
            </button>
          </form>
        </Section>

        {/* Privacy */}
        <Section title="Privacy & Security">
          <div className="text-sm text-[#a09cc0] space-y-2 leading-relaxed">
            <p>• Your real name is never shown to other users</p>
            <p>• Only your chosen username is visible on posts</p>
            <p>• Your email is never publicly displayed</p>
            <p>• All data is secured via Firebase Authentication</p>
          </div>
        </Section>

        {/* Danger zone */}
        <div className="card border-red-500/20 p-5">
          <h2 className="font-display font-semibold text-sm mb-3 text-red-400">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Delete Account</div>
              <div className="text-xs text-[#5a5680] mt-0.5">Permanently removes all your data</div>
            </div>
            <button onClick={() => setShowDeleteModal(true)} className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5">
              <AlertTriangle size={13} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}
