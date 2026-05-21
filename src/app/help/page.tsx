'use client';
import { useState } from 'react';
import { Mail, ChevronDown, Shield, BookOpen, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Settings → Change Password, or use "Forgot Password" on the login page. You\'ll receive a secure reset link to your email.' },
  { q: 'Is my identity truly anonymous?', a: 'Yes. Only your chosen username is shown — never your real name, email, or personal info. Pick a username that doesn\'t reveal your identity.' },
  { q: 'How do I report abusive content?', a: 'Click the three-dot menu (⋯) on any post or comment and select "Report". Our team reviews all reports within 24 hours.' },
  { q: 'Can I delete my account permanently?', a: 'Yes. Go to Settings → Danger Zone → Delete Account. This requires your password and typed confirmation, then permanently deletes all your data.' },
  { q: 'Why was my post removed?', a: 'Posts may be removed for violating community guidelines. Contact us at stacksolveofficial@gmail.com for clarification.' },
  { q: 'How do I change my username?', a: 'Usernames cannot be changed after account creation to maintain community trust and prevent impersonation.' },
  { q: 'How do I recover a locked account?', a: 'Use the "Forgot Password" flow on the login page. If you\'ve lost access to your email too, contact stacksolveofficial@gmail.com.' },
  { q: 'Is StackSolve free to use?', a: 'Yes, StackSolve is completely free for all college students. No hidden charges.' },
];

const guidelines = [
  'Be respectful and supportive of fellow students',
  'Do not share personal information (real name, phone number, location)',
  'No harassment, hate speech, or bullying of any kind',
  'Keep discussions academic and constructive',
  'Report abusive content using the report button',
  'Do not impersonate other users or public figures',
  'No spam, self-promotion, or repetitive posts',
  'Do not share copyrighted academic material',
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden mb-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-2 transition-colors">
        <span className="text-[13.5px] font-medium pr-4">{q}</span>
        <ChevronDown size={15} className={cn('text-[#5a5680] flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div className={cn('overflow-hidden transition-all duration-200', open ? 'max-h-48' : 'max-h-0')}>
        <p className="px-5 pb-4 text-[13px] text-[#a09cc0] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5">
        <h1 className="font-display font-bold text-base">Help & Support</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Contact card */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-600/10 to-emerald-400/8 border border-brand-600/20 p-6 text-center mb-8">
          <div className="text-4xl mb-3">🛟</div>
          <h2 className="font-display font-bold text-xl mb-2">We're here to help</h2>
          <p className="text-sm text-[#a09cc0] mb-4">For any help or query, reach us directly:</p>
          <a href="mailto:stacksolveofficial@gmail.com" className="inline-flex items-center gap-2 text-brand-400 font-semibold text-[15px] hover:text-brand-300 transition-colors">
            <Mail size={16} /> stacksolveofficial@gmail.com
          </a>
          <p className="text-[11px] text-[#5a5680] mt-3">We typically respond within 24 hours</p>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={15} className="text-brand-400" />
            <h2 className="font-display font-semibold text-base">Frequently Asked Questions</h2>
          </div>
          {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>

        {/* Community guidelines */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={15} className="text-brand-400" />
            <h2 className="font-display font-semibold text-base">Community Guidelines</h2>
          </div>
          <div className="card p-5">
            <ul className="space-y-3">
              {guidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-3 text-[13.5px] text-[#a09cc0]">
                  <span className="w-5 h-5 rounded-lg bg-brand-600/12 text-brand-400 text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Privacy note */}
        <div className="card border-brand-600/20 p-5">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-display font-semibold text-sm mb-2">Your Privacy Matters</h3>
              <p className="text-[13px] text-[#a09cc0] leading-relaxed">
                StackSolve is designed with privacy first. We never expose your real identity. Your email is only used for account security and is never visible to other users. Read our{' '}
                <a href="/privacy" className="text-brand-400 hover:text-brand-300">Privacy Policy</a> for full details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
